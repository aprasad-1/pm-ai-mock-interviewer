import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { adminDb } from '@/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Industry best practice: Use database for idempotency to handle server restarts
async function isEventProcessed(eventId: string): Promise<boolean> {
  try {
    const eventDoc = await adminDb.collection('processed_events').doc(eventId).get()
    return eventDoc.exists
  } catch (error) {
    console.error('Error checking event processing status:', error)
    return false
  }
}

async function markEventProcessed(eventId: string): Promise<void> {
  try {
    await adminDb.collection('processed_events').doc(eventId).set({
      processedAt: FieldValue.serverTimestamp(),
      eventId
    })
    
    // Cleanup old events (keep only last 7 days) - industry best practice
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    // Run cleanup occasionally (1% chance to avoid performance impact)
    if (Math.random() < 0.01) {
      console.log('🧹 Cleaning up old processed events...')
      const oldEvents = await adminDb.collection('processed_events')
        .where('processedAt', '<', sevenDaysAgo)
        .limit(100)
        .get()
      
      const batch = adminDb.batch()
      oldEvents.docs.forEach(doc => batch.delete(doc.ref))
      
      if (!oldEvents.empty) {
        await batch.commit()
        console.log(`🗑️ Cleaned up ${oldEvents.size} old processed events`)
      }
    }
  } catch (error) {
    console.error('Error marking event as processed:', error)
  }
}

export async function POST(req: NextRequest) {
  console.log('🔔 Stripe webhook received')
  
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('❌ No stripe signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    let event: any

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log('✅ Webhook signature verified')
    } catch (err: any) {
      console.error(`❌ Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Industry best practice: Idempotency check using database
    if (await isEventProcessed(event.id)) {
      console.log(`⚠️ Event ${event.id} already processed, skipping`)
      return NextResponse.json({ received: true })
    }

    console.log(`📮 Processing webhook: ${event.type}`, {
      eventId: event.id,
      created: new Date(event.created * 1000).toISOString()
    })

    // Process the event
    let result = false
    switch (event.type) {
      case 'checkout.session.completed':
        result = await handleCheckoutCompleted(event.data.object)
        break

      case 'customer.subscription.created':
        result = await handleSubscriptionCreated(event.data.object)
        break

      case 'customer.subscription.updated':
        result = await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        result = await handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_succeeded':
        result = await handleInvoicePaymentSucceeded(event.data.object)
        break

      case 'invoice.payment_failed':
        result = await handleInvoicePaymentFailed(event.data.object)
        break

      case 'customer.subscription.trial_will_end':
        result = await handleTrialWillEnd(event.data.object)
        break

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`)
        result = true // Don't fail for unhandled events
    }

    if (result) {
      // Mark event as processed in database
      await markEventProcessed(event.id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

/**
 * Handle successful checkout completion
 * This is the primary entry point for new subscriptions
 */
async function handleCheckoutCompleted(session: any): Promise<boolean> {
  try {
    const { customer, client_reference_id: userId, subscription, mode, amount_total, currency } = session

    console.log('🎯 Processing checkout completion:', {
      userId,
      customer,
      subscription,
      mode,
      amount_total,
      currency,
      sessionId: session.id
    })

    if (!userId) {
      console.error('❌ No userId in checkout session')
      return false
    }

    // Verify user exists
    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      console.error(`❌ User ${userId} not found in database`)
      return false
    }

    const userData = userDoc.data()
    console.log(`👤 User before upgrade:`, {
      email: userData?.email,
      currentStatus: userData?.subscriptionStatus,
      currentMinutes: userData?.walletMinutes
    })

    // Handle subscription mode (recurring payments)
    if (mode === 'subscription' && subscription) {
      // Prevent duplicate subscription processing
      if (userData?.subscriptionId === subscription && userData?.subscriptionStatus === 'active') {
        console.log(`⚠️ User ${userId} already has this active subscription: ${subscription}`)
        return true // Already processed, don't fail
      }

      const currentWalletMinutes = userData?.walletMinutes || 0
      const lastUpgradeBonus = userData?.lastUpgradeBonus
      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      
      // Industry best practice: Prevent gaming by limiting upgrade bonus to once per calendar month
      let shouldAddUpgradeBonus = true
      let newWalletMinutes = currentWalletMinutes
      
      if (lastUpgradeBonus) {
        const lastBonusDate = new Date(lastUpgradeBonus)
        const lastBonusMonth = `${lastBonusDate.getFullYear()}-${String(lastBonusDate.getMonth() + 1).padStart(2, '0')}`
        
        if (lastBonusMonth === currentMonth) {
          shouldAddUpgradeBonus = false
          console.log(`🚫 User ${userId} already received upgrade bonus this month (${currentMonth})`)
        }
      }
      
      if (shouldAddUpgradeBonus) {
        newWalletMinutes = Math.max(currentWalletMinutes + 100, 100)
        console.log(`✅ Adding 100 minute upgrade bonus to user ${userId}`)
      } else {
        console.log(`ℹ️ User ${userId} reactivating without bonus (already received this month)`)
      }
      
      const updateData: any = {
        stripeCustomerId: customer,
        subscriptionId: subscription,
        subscriptionStatus: 'active',
        walletMinutes: newWalletMinutes,
        monthlyMinuteAllocation: 100, // Pro users get 100 minutes per month
        paymentFailed: false,
        cancelAtPeriodEnd: false,
        lastMonthlyReset: FieldValue.serverTimestamp(), // Track when minutes were added
        upgradedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }

      // Only update lastUpgradeBonus if we actually gave the bonus
      if (shouldAddUpgradeBonus) {
        updateData.lastUpgradeBonus = now.toISOString()
      }

      await adminDb.collection('users').doc(userId).update(updateData)

      console.log(`✅ User ${userId} upgraded to Pro subscription`)
      
      // Log successful upgrade
      await logAnalyticsEvent('subscription_created', {
        userId,
        email: userData?.email,
        subscriptionId: subscription,
        amount: amount_total / 100,
        currency,
      })
    }

    return true
  } catch (error) {
    console.error('❌ Error handling checkout completion:', error)
    await logWebhookError('checkout.session.completed', error, session)
    return false
  }
}

/**
 * Handle new subscription creation
 */
async function handleSubscriptionCreated(subscription: any): Promise<boolean> {
  try {
    console.log(`🆕 New subscription created: ${subscription.id}`)
    
    // Find user by customer ID
    const user = await findUserByCustomerId(subscription.customer)
    if (!user) return false

    const updateData = {
      subscriptionId: subscription.id,
      subscriptionStatus: mapStripeStatus(subscription.status),
      subscriptionEndDate: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      walletMinutes: subscription.status === 'active' ? -1 : user.data.walletMinutes,
      updatedAt: FieldValue.serverTimestamp(),
    }

    await adminDb.collection('users').doc(user.id).update(updateData)
    
    console.log(`✅ Subscription created for user ${user.id}`)
    return true
  } catch (error) {
    console.error('❌ Error handling subscription creation:', error)
    await logWebhookError('customer.subscription.created', error, subscription)
    return false
  }
}

/**
 * Handle subscription updates (status changes, plan changes, etc.)
 */
async function handleSubscriptionUpdated(subscription: any): Promise<boolean> {
  try {
    const { id, status, current_period_end, cancel_at_period_end, customer } = subscription

    console.log(`🔄 Subscription updated: ${id}`, {
      status,
      cancel_at_period_end,
      current_period_end: new Date(current_period_end * 1000).toISOString()
    })

    // Find user by customer ID
    const user = await findUserByCustomerId(customer)
    if (!user) return false

    const currentStatus = user.data.subscriptionStatus
    const newStatus = mapStripeStatus(status)
    const currentWalletMinutes = user.data.walletMinutes || 0
    
    // Industry best practice: Handle wallet minutes based on subscription changes
    let walletMinutes = currentWalletMinutes
    let monthlyMinuteAllocation = user.data.monthlyMinuteAllocation || 0
    let shouldTrackUpgradeBonus = false
    let upgradeBonusDate = null
    
    if (newStatus === 'active') {
      // For active subscriptions, ensure they have the Pro allocation
      monthlyMinuteAllocation = 100
      
      // If reactivating from canceled, check if they can get bonus this month
      if (currentStatus === 'canceled') {
        const lastUpgradeBonus = user.data.lastUpgradeBonus
        const now = new Date()
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        
        let shouldAddReactivationBonus = true
        
        if (lastUpgradeBonus) {
          const lastBonusDate = new Date(lastUpgradeBonus)
          const lastBonusMonth = `${lastBonusDate.getFullYear()}-${String(lastBonusDate.getMonth() + 1).padStart(2, '0')}`
          
          if (lastBonusMonth === currentMonth) {
            shouldAddReactivationBonus = false
            console.log(`🚫 User ${user.id} already received upgrade bonus this month (${currentMonth}) - no reactivation bonus`)
          }
        }
        
        if (shouldAddReactivationBonus) {
          walletMinutes = Math.max(currentWalletMinutes + 100, 100)
          console.log(`🔄 Reactivation: Adding 100 minutes to ${currentWalletMinutes} = ${walletMinutes}`)
          // Track that they got their monthly bonus
          shouldTrackUpgradeBonus = true
          upgradeBonusDate = now.toISOString()
        } else {
          console.log(`🔄 Reactivation: No bonus (already received this month)`)
        }
      }
    } else if (newStatus === 'canceled' && currentStatus === 'active') {
      // User canceled - keep their existing minutes but remove monthly allocation
      monthlyMinuteAllocation = 0
      // Don't reset to 30 - let them keep what they earned
      console.log(`❌ Cancellation: Keeping ${walletMinutes} minutes, removing monthly allocation`)
    } else if (newStatus === 'past_due') {
      // Payment failed - keep allocation but limited access
      monthlyMinuteAllocation = 100
    }

    const updateData: any = {
      subscriptionStatus: newStatus,
      subscriptionEndDate: new Date(current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: cancel_at_period_end || false,
      walletMinutes,
      monthlyMinuteAllocation,
      paymentFailed: newStatus === 'active' ? false : user.data.paymentFailed,
      updatedAt: FieldValue.serverTimestamp(),
    }

    // Add upgrade bonus tracking if needed
    if (shouldTrackUpgradeBonus && upgradeBonusDate) {
      updateData.lastUpgradeBonus = upgradeBonusDate
    }

    // Handle reactivation
    if (currentStatus === 'canceled' && newStatus === 'active') {
      updateData['reactivatedAt'] = FieldValue.serverTimestamp()
      updateData['lastMonthlyReset'] = FieldValue.serverTimestamp()
      console.log(`🔄 Subscription reactivated for user ${user.id}`)
      
      await logAnalyticsEvent('subscription_reactivated', {
        userId: user.id,
        email: user.data.email,
        subscriptionId: id,
        previousStatus: currentStatus,
        newStatus,
      })
    }

    await adminDb.collection('users').doc(user.id).update(updateData)
    
    console.log(`✅ Subscription updated for user ${user.id}: ${currentStatus} → ${newStatus}`)
    return true
  } catch (error) {
    console.error('❌ Error handling subscription update:', error)
    await logWebhookError('customer.subscription.updated', error, subscription)
    return false
  }
}

/**
 * Handle subscription deletion (immediate cancellation)
 */
async function handleSubscriptionDeleted(subscription: any): Promise<boolean> {
  try {
    console.log(`🗑️ Subscription deleted: ${subscription.id}`)

    // Find user by customer ID
    const user = await findUserByCustomerId(subscription.customer)
    if (!user) return false

    // Revert to free plan with some free minutes
    const updateData = {
      subscriptionStatus: 'canceled',
      subscriptionId: null,
      walletMinutes: 30, // Give some free minutes
      cancelAtPeriodEnd: false,
      canceledAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    await adminDb.collection('users').doc(user.id).update(updateData)

    console.log(`✅ Subscription deleted for user ${user.id}`)
    
    await logAnalyticsEvent('subscription_canceled', {
      userId: user.id,
      email: user.data.email,
      subscriptionId: subscription.id,
    })

    return true
  } catch (error) {
    console.error('❌ Error handling subscription deletion:', error)
    await logWebhookError('customer.subscription.deleted', error, subscription)
    return false
  }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: any): Promise<boolean> {
  try {
    console.log(`✅ Invoice payment succeeded: ${invoice.id}`, {
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      billing_reason: invoice.billing_reason
    })

    // Find user by customer ID
    const user = await findUserByCustomerId(invoice.customer)
    if (!user) return false

    const currentWalletMinutes = user.data.walletMinutes || 0
    const lastMonthlyReset = user.data.lastMonthlyReset
    
    // Industry best practice: Add 100 minutes for each successful monthly payment
    // But prevent exploitation by checking if this is a legitimate monthly billing
    let shouldAddMinutes = false
    let newWalletMinutes = currentWalletMinutes

    // Check if this is a recurring subscription payment (not initial)
    if (invoice.billing_reason === 'subscription_cycle') {
      // This is a monthly recurring payment - add 100 minutes
      shouldAddMinutes = true
      newWalletMinutes = currentWalletMinutes + 100
      console.log(`💰 Monthly billing: Adding 100 minutes to ${currentWalletMinutes} = ${newWalletMinutes}`)
    } else if (invoice.billing_reason === 'subscription_create') {
      // This is the initial payment - minutes already added in checkout handler
      console.log(`🎯 Initial subscription payment - minutes already allocated`)
    }

    const updateData: any = {
      paymentFailed: false,
      lastPaymentAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    // Add minutes if this is a monthly cycle
    if (shouldAddMinutes) {
      updateData.walletMinutes = newWalletMinutes
      updateData.lastMonthlyReset = FieldValue.serverTimestamp()
    }

    // If subscription was past due, reactivate it
    if (user.data.subscriptionStatus === 'past_due') {
      updateData.subscriptionStatus = 'active'
      updateData.monthlyMinuteAllocation = 100
      
      // If reactivating, ensure they get their monthly minutes
      if (!shouldAddMinutes) {
        updateData.walletMinutes = Math.max(currentWalletMinutes + 100, 100)
        updateData.lastMonthlyReset = FieldValue.serverTimestamp()
        console.log(`🔄 Reactivating past due subscription with 100 minutes`)
      }
    }

    await adminDb.collection('users').doc(user.id).update(updateData)

    console.log(`✅ Payment processed for user ${user.id}`)
    
    // Log monthly billing for analytics
    if (shouldAddMinutes) {
      await logAnalyticsEvent('monthly_minutes_added', {
        userId: user.id,
        email: user.data.email,
        minutesAdded: 100,
        newBalance: newWalletMinutes,
        invoiceId: invoice.id,
      })
    }

    return true
  } catch (error) {
    console.error('❌ Error handling invoice payment success:', error)
    await logWebhookError('invoice.payment_succeeded', error, invoice)
    return false
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: any): Promise<boolean> {
  try {
    console.log(`❌ Invoice payment failed: ${invoice.id}`)

    // Find user by customer ID
    const user = await findUserByCustomerId(invoice.customer)
    if (!user) return false

    // Mark payment as failed and set status to past_due
    const updateData = {
      paymentFailed: true,
      subscriptionStatus: 'past_due',
      walletMinutes: 30, // Reduced minutes for past due accounts
      lastPaymentFailedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    await adminDb.collection('users').doc(user.id).update(updateData)

    console.log(`⚠️ Payment failed for user ${user.id}`)
    
    await logAnalyticsEvent('payment_failed', {
      userId: user.id,
      email: user.data.email,
      invoiceId: invoice.id,
      amount: invoice.amount_due / 100,
    })

    return true
  } catch (error) {
    console.error('❌ Error handling invoice payment failure:', error)
    await logWebhookError('invoice.payment_failed', error, invoice)
    return false
  }
}

/**
 * Handle trial ending soon
 */
async function handleTrialWillEnd(subscription: any): Promise<boolean> {
  try {
    console.log(`⏰ Trial ending soon: ${subscription.id}`)

    // Find user by customer ID
    const user = await findUserByCustomerId(subscription.customer)
    if (!user) return false

    // You could send an email notification here
    console.log(`📧 Should notify user ${user.id} that trial is ending`)

    return true
  } catch (error) {
    console.error('❌ Error handling trial will end:', error)
    return false
  }
}

/**
 * Helper function to find user by Stripe customer ID
 */
async function findUserByCustomerId(customerId: string) {
  const usersSnapshot = await adminDb
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get()

  if (usersSnapshot.empty) {
    console.error(`❌ No user found for customer ${customerId}`)
    return null
  }

  const userDoc = usersSnapshot.docs[0]
  return {
    id: userDoc.id,
    data: userDoc.data()
  }
}

/**
 * Map Stripe subscription status to our internal status
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
      console.warn(`Unknown Stripe status: ${stripeStatus}`)
      return 'free'
  }
}

/**
 * Log analytics events
 */
async function logAnalyticsEvent(event: string, data: any) {
  try {
    await adminDb.collection('analytics').add({
      event,
      ...data,
      timestamp: FieldValue.serverTimestamp(),
    })
  } catch (error) {
    console.error('Failed to log analytics event:', error)
  }
}

/**
 * Log webhook errors for debugging
 */
async function logWebhookError(eventType: string, error: any, data: any) {
  try {
    await adminDb.collection('webhook_errors').add({
      eventType,
      error: error.message,
      stack: error.stack,
      data: JSON.stringify(data),
      timestamp: FieldValue.serverTimestamp(),
    })
  } catch (logError) {
    console.error('Failed to log webhook error:', logError)
  }
}