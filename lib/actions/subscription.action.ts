'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/firebase/admin'
import { stripe } from '@/lib/stripe/server'
import { STRIPE_CONFIG } from '@/lib/stripe/config'

export interface SubscriptionInfo {
  status: 'free' | 'active' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  planName: string
  price?: string
  features: string[]
  walletMinutes: number
}

/**
 * Get user's subscription information
 */
export async function getSubscriptionInfo(): Promise<SubscriptionInfo> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return {
        status: 'free',
        planName: 'Free Plan',
        features: STRIPE_CONFIG.features.free.features,
        walletMinutes: 30,
      }
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    const userId = decodedToken.uid

    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      throw new Error('User not found')
    }

    const userData = userDoc.data()
    const subscriptionStatus = userData?.subscriptionStatus || 'free'
    const walletMinutes = userData?.walletMinutes ?? 0

    // For Pro users with active subscription
    if (subscriptionStatus === 'active' && userData?.subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(userData.subscriptionId)
        
        return {
          status: 'active',
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          planName: STRIPE_CONFIG.features.pro.name,
          price: STRIPE_CONFIG.features.pro.price,
          features: STRIPE_CONFIG.features.pro.features,
          walletMinutes: -1, // Unlimited
        }
      } catch (error: any) {
        if (error.code === 'resource_missing') {
          console.log('⚠️ Subscription exists in different Stripe mode, reverting to free plan')
          // Clear the invalid subscription data
          await adminDb.collection('users').doc(userId).update({
            subscriptionStatus: 'free',
            subscriptionId: null,
            stripeCustomerId: null,
          })
        } else {
          console.error('Error fetching subscription from Stripe:', error)
        }
      }
    }

    // Default to free plan
    return {
      status: subscriptionStatus as any,
      planName: subscriptionStatus === 'canceled' ? 'Free Plan (Canceled Pro)' : 'Free Plan',
      features: STRIPE_CONFIG.features.free.features,
      walletMinutes,
    }
  } catch (error) {
    console.error('Error getting subscription info:', error)
    return {
      status: 'free',
      planName: 'Free Plan',
      features: STRIPE_CONFIG.features.free.features,
      walletMinutes: 30,
    }
  }
}

/**
 * Create a Stripe customer portal session for subscription management
 */
export async function createCustomerPortalSession(): Promise<{ url: string } | { error: string }> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return { error: 'Unauthorized' }
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    const userId = decodedToken.uid

    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return { error: 'User not found' }
    }

    const userData = userDoc.data()
    const customerId = userData?.stripeCustomerId

    if (!customerId) {
      return { error: 'No subscription found' }
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: STRIPE_CONFIG.urls.portalReturnUrl,
    })

    return { url: session.url }
  } catch (error: any) {
    console.error('Error creating portal session:', error)
    return { error: error.message || 'Failed to create portal session' }
  }
}

/**
 * Cancel user's subscription at period end
 */
export async function cancelSubscription(): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return { success: false, message: 'Unauthorized' }
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    const userId = decodedToken.uid

    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return { success: false, message: 'User not found' }
    }

    const userData = userDoc.data()
    const subscriptionId = userData?.subscriptionId

    if (!subscriptionId) {
      return { success: false, message: 'No active subscription found' }
    }

    // Cancel at period end (user keeps access until end of billing period)
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    // Update database
    await adminDb.collection('users').doc(userId).update({
      cancelAtPeriodEnd: true,
    })

    return { 
      success: true, 
      message: 'Subscription will be canceled at the end of the billing period' 
    }
  } catch (error: any) {
    console.error('Error canceling subscription:', error)
    return { 
      success: false, 
      message: error.message || 'Failed to cancel subscription' 
    }
  }
}

/**
 * Resume a canceled subscription
 */
export async function resumeSubscription(): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return { success: false, message: 'Unauthorized' }
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    const userId = decodedToken.uid

    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return { success: false, message: 'User not found' }
    }

    const userData = userDoc.data()
    const subscriptionId = userData?.subscriptionId

    if (!subscriptionId) {
      return { success: false, message: 'No subscription found' }
    }

    // Resume subscription
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })

    // Update database
    await adminDb.collection('users').doc(userId).update({
      cancelAtPeriodEnd: false,
    })

    return { 
      success: true, 
      message: 'Subscription resumed successfully' 
    }
  } catch (error: any) {
    console.error('Error resuming subscription:', error)
    return { 
      success: false, 
      message: error.message || 'Failed to resume subscription' 
    }
  }
}

/**
 * Check if user has an active Pro subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  try {
    const info = await getSubscriptionInfo()
    return info.status === 'active'
  } catch (error) {
    console.error('Error checking subscription:', error)
    return false
  }
}
