import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { adminDb } from '@/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  console.log('🔔 Webhook endpoint hit')
  
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    console.log('📋 Webhook details:', {
      hasBody: !!body,
      bodyLength: body.length,
      hasSignature: !!signature,
      webhookSecretConfigured: !!webhookSecret
    })

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
      console.error('Debug info:', {
        signatureLength: signature.length,
        webhookSecretLength: webhookSecret.length,
        webhookSecretPreview: webhookSecret.substring(0, 20) + '...',
        bodyPreview: body.substring(0, 100),
        errorType: err.constructor.name
      })
      
      // Log the exact error for debugging
      console.error('Full error:', err)
      
      return NextResponse.json({ 
        error: 'Invalid signature',
        debug: {
          message: err.message,
          hasSignature: !!signature,
          hasWebhookSecret: !!webhookSecret
        }
      }, { status: 400 })
    }

    console.log(`📮 Webhook received: ${event.type}`, {
      eventId: event.id,
      created: new Date(event.created * 1000).toISOString()
    })

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        await handleInvoicePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: any) {
  try {
    const { customer, client_reference_id: userId, subscription, amount_total, currency } = session

    console.log('🎯 Processing checkout completion:', {
      userId,
      customer,
      subscription,
      amount_total,
      currency,
      sessionId: session.id
    })

    if (!userId) {
      console.error('❌ No userId in checkout session')
      return
    }

    // Verify user exists
    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      console.error(`❌ User ${userId} not found in database`)
      return
    }

    const userData = userDoc.data()
    console.log(`👤 User before upgrade:`, {
      email: userData?.email,
      currentStatus: userData?.subscriptionStatus,
      currentMinutes: userData?.walletMinutes
    })

    // Update user with subscription details
    const updateData: any = {
      stripeCustomerId: customer,
      subscriptionId: subscription,
      subscriptionStatus: 'active',
      walletMinutes: 100, // 100 minutes for Pro users
      monthlyMinuteAllocation: 100, // Track monthly allocation
      lastMonthlyReset: FieldValue.serverTimestamp(), // Track when minutes were last reset
      updatedAt: FieldValue.serverTimestamp(),
      // Track upgrade timestamp
      upgradedAt: FieldValue.serverTimestamp(),
      // Clear any payment failed flags
      paymentFailed: false,
    }

    await adminDb.collection('users').doc(userId).update(updateData)

    console.log(`✅ User ${userId} (${userData?.email}) upgraded to Pro successfully`)
    console.log(`💰 Payment: ${amount_total / 100} ${currency?.toUpperCase()}`)
    
    // Log successful upgrade for analytics
    await adminDb.collection('analytics').add({
      event: 'user_upgraded',
      userId,
      email: userData?.email,
      subscriptionId: subscription,
      amount: amount_total / 100,
      currency,
      timestamp: FieldValue.serverTimestamp(),
    })

  } catch (error) {
    console.error('❌ Error handling checkout completion:', error)
    
    // Log error for debugging
    await adminDb.collection('webhook_errors').add({
      event: 'checkout.session.completed',
      error: error.message,
      stack: error.stack,
      timestamp: FieldValue.serverTimestamp(),
    }).catch(e => console.error('Failed to log error:', e))
    
    throw error
  }
}

async function handleSubscriptionUpdate(subscription: any) {
  try {
    const { customer, id, status, current_period_end } = subscription

    console.log(`🔄 Processing subscription update:`, {
      subscriptionId: id,
      customer,
      status,
      current_period_end: new Date(current_period_end * 1000).toISOString()
    })

    // Find user by Stripe customer ID
    const usersSnapshot = await adminDb
      .collection('users')
      .where('stripeCustomerId', '==', customer)
      .limit(1)
      .get()

    if (usersSnapshot.empty) {
      console.error(`❌ No user found for customer ${customer}`)
      console.log('💡 This might happen if subscription events arrive before checkout completion')
      return
    }

    const userDoc = usersSnapshot.docs[0]
    const userId = userDoc.id

    // Map Stripe status to our status
    const subscriptionStatus = mapStripeStatus(status)

    // Update user subscription
    await adminDb.collection('users').doc(userId).update({
      subscriptionId: id,
      subscriptionStatus,
      subscriptionEndDate: new Date(current_period_end * 1000).toISOString(),
      walletMinutes: subscriptionStatus === 'active' ? 100 : userDoc.data().walletMinutes,
      updatedAt: FieldValue.serverTimestamp(),
    })

    console.log(`✅ Updated subscription for user ${userId}: ${status}`)
  } catch (error: any) {
    console.error('❌ Error handling subscription update:', error)
    
    // Log error for debugging
    await adminDb.collection('webhook_errors').add({
      event: 'customer.subscription.updated',
      error: error.message,
      stack: error.stack,
      subscriptionId: subscription?.id,
      customer: subscription?.customer,
      timestamp: FieldValue.serverTimestamp(),
    }).catch(e => console.error('Failed to log error:', e))
    
    throw error
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const { customer } = subscription

    // Find user by Stripe customer ID
    const usersSnapshot = await adminDb
      .collection('users')
      .where('stripeCustomerId', '==', customer)
      .limit(1)
      .get()

    if (usersSnapshot.empty) {
      console.error(`No user found for customer ${customer}`)
      return
    }

    const userDoc = usersSnapshot.docs[0]
    const userId = userDoc.id

    // Revert to free plan
    await adminDb.collection('users').doc(userId).update({
      subscriptionStatus: 'canceled',
      subscriptionId: null,
      // Keep existing wallet minutes but remove unlimited status
      walletMinutes: userDoc.data().walletMinutes === -1 ? 0 : userDoc.data().walletMinutes,
      updatedAt: FieldValue.serverTimestamp(),
    })

    console.log(`✅ Subscription canceled for user ${userId}`)
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
    throw error
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  console.log(`✅ Payment succeeded for invoice ${invoice.id}`)
  // You can add logic here to send receipt emails, etc.
}

async function handleInvoicePaymentFailed(invoice: any) {
  const { customer } = invoice

  // Find user and notify them
  const usersSnapshot = await adminDb
    .collection('users')
    .where('stripeCustomerId', '==', customer)
    .limit(1)
    .get()

  if (!usersSnapshot.empty) {
    const userId = usersSnapshot.docs[0].id
    console.error(`⚠️ Payment failed for user ${userId}`)
    
    // You could update a payment_failed flag here to show a banner in the UI
    await adminDb.collection('users').doc(userId).update({
      paymentFailed: true,
      updatedAt: FieldValue.serverTimestamp(),
    })
  }
}

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
    default:
      return 'free'
  }
}
