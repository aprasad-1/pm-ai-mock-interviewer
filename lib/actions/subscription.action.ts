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
  paymentFailed?: boolean
  canReactivate?: boolean
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
    const paymentFailed = userData?.paymentFailed || false

    // Handle users with subscription IDs - automatic sync with Stripe
    if (userData?.subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(userData.subscriptionId)
        const stripeStatus = subscription.status
        const mappedStripeStatus = mapStripeStatus(stripeStatus)
        
        // Always sync with Stripe's current status (industry best practice)
        if (subscriptionStatus !== mappedStripeStatus) {
          console.log(`🔄 Auto-syncing subscription: ${subscriptionStatus} → ${mappedStripeStatus}`)
          
          const syncData: any = {
            subscriptionStatus: mappedStripeStatus,
            subscriptionEndDate: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            updatedAt: new Date().toISOString(),
          }
          
          // Update allocation based on status (don't modify existing wallet minutes)
          if (mappedStripeStatus === 'active') {
            syncData.monthlyMinuteAllocation = 100 // Pro allocation
            syncData.paymentFailed = false
          } else if (mappedStripeStatus === 'past_due') {
            syncData.monthlyMinuteAllocation = 100 // Keep allocation but mark payment failed
            syncData.paymentFailed = true
          } else if (mappedStripeStatus === 'canceled') {
            syncData.monthlyMinuteAllocation = 0 // Remove allocation
            syncData.subscriptionId = null // Clear subscription
            // Keep existing wallet minutes - don't reset to 30
          }
          
          // Perform the sync
          await adminDb.collection('users').doc(userId).update(syncData)
          
          // Return the updated status immediately
          return {
            status: mappedStripeStatus as any,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            planName: mappedStripeStatus === 'active' ? STRIPE_CONFIG.features.pro.name : 'Free Plan',
            price: mappedStripeStatus === 'active' ? STRIPE_CONFIG.features.pro.price : undefined,
            features: mappedStripeStatus === 'active' ? STRIPE_CONFIG.features.pro.features : STRIPE_CONFIG.features.free.features,
            walletMinutes: walletMinutes,
            paymentFailed: mappedStripeStatus === 'past_due',
            canReactivate: mappedStripeStatus === 'past_due' || (mappedStripeStatus === 'canceled' && subscription.cancel_at_period_end),
          }
        }
        
        // Status is in sync, return current info
        if (subscriptionStatus === 'active') {
          return {
            status: 'active',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            planName: STRIPE_CONFIG.features.pro.name,
            price: STRIPE_CONFIG.features.pro.price,
            features: STRIPE_CONFIG.features.pro.features,
            walletMinutes: walletMinutes,
            paymentFailed: false,
            canReactivate: false,
          }
        }
        
      } catch (error: any) {
        if (error.code === 'resource_missing') {
          console.log('⚠️ Subscription not found in Stripe, cleaning up database')
          // Clear invalid subscription data
          await adminDb.collection('users').doc(userId).update({
            subscriptionStatus: 'free',
            subscriptionId: null,
            stripeCustomerId: null,
            cancelAtPeriodEnd: false,
            paymentFailed: false,
            updatedAt: new Date().toISOString(),
          })
        } else {
          console.error('Error fetching subscription from Stripe:', error)
        }
      }
    }

    // Industry best practice: Check for active subscriptions even if no subscriptionId
    // This handles cases where webhooks failed or were missed
    if (userData?.stripeCustomerId && !userData?.subscriptionId) {
      try {
        console.log('🔍 Checking for missed active subscriptions...')
        const subscriptions = await stripe.subscriptions.list({
          customer: userData.stripeCustomerId,
          status: 'active',
          limit: 1
        })

        if (subscriptions.data.length > 0) {
          const activeSubscription = subscriptions.data[0]
          console.log(`✅ Found missed active subscription: ${activeSubscription.id}`)
          
          // Calculate new wallet minutes for missed active subscription
          const newWalletMinutes = Math.max((walletMinutes || 0) + 100, 100)
          
          // Update database with the found subscription
          const syncData = {
            subscriptionId: activeSubscription.id,
            subscriptionStatus: 'active',
            subscriptionEndDate: new Date(activeSubscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
            walletMinutes: newWalletMinutes, // Add 100 minutes for active subscription
            monthlyMinuteAllocation: 100,
            lastMonthlyReset: new Date().toISOString(),
            paymentFailed: false,
            updatedAt: new Date().toISOString(),
          }
          
          await adminDb.collection('users').doc(userId).update(syncData)
          
          // Return the active subscription info
          return {
            status: 'active',
            currentPeriodEnd: new Date(activeSubscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
            planName: STRIPE_CONFIG.features.pro.name,
            price: STRIPE_CONFIG.features.pro.price,
            features: STRIPE_CONFIG.features.pro.features,
            walletMinutes: newWalletMinutes,
            paymentFailed: false,
            canReactivate: false,
          }
        }
      } catch (error) {
        console.error('Error checking for active subscriptions:', error)
      }
    }

    // Handle "cancel at period end" - user keeps Pro benefits until period ends
    const now = new Date()
    const subscriptionEndDate = userDoc.data()?.subscriptionEndDate
    const cancelAtPeriodEnd = userDoc.data()?.cancelAtPeriodEnd
    
    let effectiveStatus = subscriptionStatus
    let planName = 'Free Plan'
    let features = STRIPE_CONFIG.features.free.features
    
    // If canceled but still within billing period, treat as active
    if (subscriptionStatus === 'canceled' && cancelAtPeriodEnd && subscriptionEndDate) {
      const endDate = new Date(subscriptionEndDate)
      if (now < endDate) {
        // Still within paid period - treat as active Pro
        effectiveStatus = 'active'
        planName = 'Pro Plan (Canceling)'
        features = STRIPE_CONFIG.features.pro.features
        console.log(`🔄 User has canceled subscription but still active until ${endDate.toISOString()}`)
      } else {
        // Period has ended - now truly canceled
        planName = 'Free Plan'
        features = STRIPE_CONFIG.features.free.features
      }
    } else if (subscriptionStatus === 'past_due') {
      planName = 'Pro Plan (Payment Required)'
      features = STRIPE_CONFIG.features.pro.features
    } else if (subscriptionStatus === 'canceled') {
      planName = 'Free Plan'
      features = STRIPE_CONFIG.features.free.features
    }

    // Return response based on effective status
    return {
      status: effectiveStatus as any,
      planName,
      features,
      walletMinutes,
      paymentFailed,
      canReactivate: subscriptionStatus === 'past_due' || subscriptionStatus === 'canceled',
      cancelAtPeriodEnd: cancelAtPeriodEnd || false,
      currentPeriodEnd: subscriptionEndDate,
    }
  } catch (error) {
    console.error('Error getting subscription info:', error)
    return {
      status: 'free',
      planName: 'Free Plan',
      features: STRIPE_CONFIG.features.free.features,
      walletMinutes: 30,
      paymentFailed: false,
      canReactivate: false,
    }
  }
}

/**
 * Helper function to map Stripe status to our internal status
 */
function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active':
      return 'active'
    case 'past_due':
      return 'past_due'
    case 'canceled':
    case 'unpaid':
      return 'canceled'
    case 'trialing':
      return 'trialing'
    case 'incomplete':
      return 'past_due'
    case 'incomplete_expired':
      return 'canceled'
    default:
      return 'free'
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
