# Stripe Integration Setup Guide

## Prerequisites
- Stripe Account (create at https://stripe.com)
- Firebase Admin SDK configured
- Next.js application running

## Step 1: Get Your Stripe Keys

1. Log into your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API Keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

## Step 2: Create a Product and Price

1. In Stripe Dashboard, go to **Products**
2. Click **+ Add Product**
3. Fill in:
   - **Name**: Pro Plan
   - **Description**: Unlimited interview minutes with advanced AI coaching
   - **Pricing**: $19.00 / month (recurring)
4. After creating, copy the **Price ID** (starts with `price_`)

## Step 3: Set Up Webhook Endpoint

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **+ Add endpoint**
3. Enter your webhook URL:
   - Local testing: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) or [ngrok](https://ngrok.com)
   - Production: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

## Step 4: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
STRIPE_PRO_PRICE_ID=price_your_price_id_here

# App URL (update for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 5: Test Locally with Stripe CLI

1. Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
# Download from https://github.com/stripe/stripe-cli/releases
```

2. Login to Stripe:
```bash
stripe login
```

3. Forward webhooks to your local server:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Copy the webhook signing secret shown and update your `.env.local`

## Step 6: Test the Integration

### Test Checkout Flow:
1. Navigate to `/pricing`
2. Click "Upgrade to Pro"
3. Use test card: `4242 4242 4242 4242`
4. Any future expiry date and any CVC
5. Complete checkout

### Test Subscription Management:
1. After successful payment, go to `/profile`
2. Click "Manage Subscription" to access Stripe portal
3. Test cancellation, resumption, and payment method updates

### Test Webhook Events:
```bash
# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.updated
```

## Step 7: Production Deployment

1. **Update environment variables** in your hosting platform (Vercel, etc.)
2. **Use production keys** (remove `test_` from keys)
3. **Update webhook endpoint** in Stripe Dashboard to production URL
4. **Enable production mode** in Stripe Dashboard
5. **Test with real payment** (you can refund yourself)

## Security Checklist

- [ ] Never expose secret keys in client-side code
- [ ] Always verify webhook signatures
- [ ] Use HTTPS in production
- [ ] Implement rate limiting on API endpoints
- [ ] Log all payment events for audit trail
- [ ] Set up alerts for failed payments
- [ ] Implement proper error handling
- [ ] Use Stripe's built-in fraud detection

## Common Issues & Solutions

### Webhook not receiving events
- Check webhook URL is correct
- Verify webhook secret matches
- Ensure your server is running
- Check firewall/security group settings

### Checkout session not creating
- Verify API keys are correct
- Check price ID exists
- Ensure user is authenticated
- Review server logs for errors

### Subscription status not updating
- Verify webhook events are being received
- Check database permissions
- Review webhook handler logic
- Ensure Firestore security rules allow updates

## Testing Cards

| Card Number | Scenario |
|------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0000 0000 0341 | Requires authentication |

## Support Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Stripe Discord](https://discord.gg/stripe)
- [Testing Guide](https://stripe.com/docs/testing)

## Next Steps

1. Set up email receipts
2. Implement usage-based billing (if needed)
3. Add annual plan option
4. Set up revenue analytics
5. Implement referral program
6. Add team/enterprise plans
