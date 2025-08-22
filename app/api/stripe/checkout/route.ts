import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe/server'
import { STRIPE_CONFIG } from '@/lib/stripe/config'
import { adminAuth, adminDb } from '@/firebase/admin'

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userId: string
    try {
      const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
      userId = decodedToken.uid
    } catch (error) {
      console.error('Invalid session:', error)
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Get user data
    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userDoc.data()
    const email = userData?.email

    if (!email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    // Check if user already has an active subscription
    if (userData?.subscriptionStatus === 'active') {
      return NextResponse.json({ 
        error: 'You already have an active subscription' 
      }, { status: 400 })
    }

    // Create or retrieve Stripe customer
    let customerId = userData?.stripeCustomerId

    // Check if we have a customer ID and if it's valid for current mode
    if (customerId) {
      try {
        // Try to retrieve the customer to see if it exists in current mode
        await stripe.customers.retrieve(customerId)
        console.log(`✅ Using existing customer: ${customerId}`)
      } catch (error: any) {
        if (error.code === 'resource_missing') {
          console.log(`⚠️ Customer ${customerId} exists in different mode, creating new one`)
          customerId = null // Force creation of new customer
        } else {
          throw error
        }
      }
    }

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      })
      customerId = customer.id

      console.log(`✅ Created new customer: ${customerId}`)

      // Save customer ID to database
      await adminDb.collection('users').doc(userId).update({
        stripeCustomerId: customerId,
      })
    }

    console.log('Creating checkout session with config:', {
      priceId: STRIPE_CONFIG.prices.pro,
      successUrl: STRIPE_CONFIG.urls.successUrl,
      cancelUrl: STRIPE_CONFIG.urls.cancelUrl,
      userId
    })

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: userId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: STRIPE_CONFIG.prices.pro,
          quantity: 1,
        },
      ],
      success_url: STRIPE_CONFIG.urls.successUrl,
      cancel_url: STRIPE_CONFIG.urls.cancelUrl,
      metadata: {
        userId,
      },
      subscription_data: {
        metadata: {
          userId,
        },
      },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Collect billing address
      billing_address_collection: 'required',
    })

    console.log(`✅ Checkout session created for user ${userId}:`, {
      sessionId: session.id,
      url: session.url
    })

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL')
    }

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    })
  } catch (error: any) {
    console.error('❌ Checkout session error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
