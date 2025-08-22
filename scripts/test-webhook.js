// Test webhook endpoint manually
// Run with: node scripts/test-webhook.js

const fetch = require('node-fetch');

async function testWebhookEndpoint() {
  try {
    console.log('🧪 Testing webhook endpoint...');
    
    const response = await fetch('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify({
        test: 'webhook'
      })
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.status === 400 && responseText.includes('Invalid signature')) {
      console.log('✅ Webhook endpoint is working (correctly rejecting invalid signature)');
    } else {
      console.log('❓ Unexpected response - check your webhook endpoint');
    }
    
  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
    console.log('💡 Make sure your development server is running on port 3000');
  }
}

testWebhookEndpoint();
