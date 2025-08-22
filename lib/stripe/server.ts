import Stripe from 'stripe'

// Server-side Stripe instance - NEVER import this on client-side
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

// Validate that we have the required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set')
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn('STRIPE_WEBHOOK_SECRET environment variable is not set - webhooks will not work')
}

if (!process.env.STRIPE_PRO_PRICE_ID) {
  console.warn('STRIPE_PRO_PRICE_ID environment variable is not set - checkout will use default test price')
}
