// Stripe configuration (safe for client-side)
export const STRIPE_CONFIG = {
  // Price IDs for different plans
  prices: {
    pro: process.env.STRIPE_PRO_PRICE_ID || 'price_test_pro',
  },
  
  // Subscription features
  features: {
    free: {
      walletMinutes: 30,
      name: 'Free Plan',
      description: 'Perfect for getting started',
      features: [
        '30 free minutes on signup',
        'Basic AI feedback',
        'Standard interview questions',
        'Interview transcripts',
      ],
    },
    pro: {
      walletMinutes: 100, // 100 minutes per month
      name: 'Pro Plan',
      description: '100 minutes monthly with advanced AI coaching',
      price: '$7/month',
      features: [
        '100 interview minutes per month',
        'Advanced AI feedback & scoring',
        'Custom interview scenarios',
        'Interview analytics & progress tracking',
        'Priority support',
        'Interview history & export',
      ],
    },
  },
  
  // URLs
  urls: {
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?success=true`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?cancelled=true`,
    portalReturnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile`,
  },
}

// Helper to check if user has unlimited minutes
export function hasUnlimitedMinutes(subscriptionStatus: string): boolean {
  return subscriptionStatus === 'active' || subscriptionStatus === 'pro'
}
