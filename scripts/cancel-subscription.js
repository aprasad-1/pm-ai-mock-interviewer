// Cancel user subscription for testing
// Run with: node scripts/cancel-subscription.js YOUR_USER_ID

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "pm-interviewer-dbef5",
      clientEmail: "firebase-adminsdk-fbsvc@pm-interviewer-dbef5.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCl8W0tyQYWPvEr\nSsRQCrvWt1UzbF54NF0zdDDmzVg04zdQ1ygau8xtEUYoMKsz/aIv+o7EjBElHPbC\nPrM5rGqJXS3lVof+le9ejA3KRbatkxHpyGP5dSf/zzqvwKQQRgNPDWwgRKhzWT7j\nf1e9XF8Bw8W+2x4qUpf3V0FCsoEweWk8r+OcZEVWpk9E+vIcV5aM0PFrktIX31Jt\nWaa+GR8UDGcQcbvd6tz7l5YOi6R6PtVfMlqMHTuvW3ynzCsHy9JYW8x95RdersYb\nmKlZbMChp16sF8RDovH9oThKx9FxHiP3YF1ND9K29rkKP5cuo2yOy0jXzoPlY1WQ\nlpEWO935AgMBAAECggEACKpmwYw0vornKHP5NDZZSI1OnFa5iLSwVMhpqNXamDlw\n2S6BLEM4Gc57/8uJ1zdUpcWDeNlZKFteufZRAO8jaZy1cbte8vEkvMbazgAtudr7\nJZ6WtO9UqUfKuGSalLR5RgKtDbLUKqDjlzj+TZfSKMsOy6iQ5tQlFjAm6uscMrog\nvhv7Tox9E/CGlavbK049I9vb4c2L08HorbWC+2WHWazrT0ZJG/Vcizaj289IvAGx\nc+hbZYbS0YC/TNu0q1EqGwB9NESlXa2E5onHHIHNCiVx9+DFgIHVE/u7lOvJdk+u\nWtl2APdFA/UMOQ7BqRcLzznINSCbxfOSi603m2lmoQKBgQDjn8Hzkx0NOrIeo2B3\nPI6w/Gi1msrn8/8FWGWkKPzHttRxMLSa0e7dBguzNkq6I7pCyc3g9+Qz6rF0DyI0\n9yX6KZVRWDZDr8l91Lg8OhWc3Dz671uAJbBUf8tfqxbq+g6QY7gHKWyO0H6MIIbk\nbIDIQJLth1AlE5XG0ZgIpMDOWQKBgQC6oTkeqd/Xx3UZjKw16dfXq/P5OtPHmKvE\nVdH4ZcdumlbwWinhh/h75nXJP2A+pV1LmTGMq+i9/Tpqd3hbLT5yL/JFfrofDMVt\n+QNnVP+jA1fi4rUc3zXwmdDnhqIDmjdi/Z5q4izO/JjBwsK2+jikHe2/MOdTJ8MH\nirKM6/fYoQKBgQDVaWKJwSNa1O5NRXZbNL6/91cg9YlJ4fz3AQMC357ojGUv3q9l\n/HAMb++mTb/QN1EZ72UEiMY/WsqXetziddn4auZhRuhRm825GSjG5tp+oArYZnQO\neMeS4eJGxv0Mv/fJroTKyi7K03XiYVi3b3dqyQg4hUZCDNO/faEicX2HuQKBgQCn\nAOBRPSfuOjDiRQxRTkj0WI4AZxDd2hNSpI043zLgGUJU4An8JCVKEgcyqACi7m0W\n2iYJwEeLw49DeFb+F/V6TsdYQregU1hUOXE/RUNghvxdLgtto5vsCmhy1foiiRyo\n+1SIRo5cRpMXSAXfoPeQfKuj28oUkk8mb4mpKvrlIQKBgHOBUlqlIt6cHcS9OZXr\nRzULP0EVimBrJ8yEehXU93w4Fj7s6x6gL98c6pI4dr7J97xHwDSb5p7/ES/nL1mW\nVkI3MHbExojorKGqpS8vFegPMR6t0EtKzM9qy9KsaFESNKNIZlH5vMMU1BmHF9J+\nS0D4cDQOhRl5AclaPL3y4pDq\n-----END PRIVATE KEY-----\n"
    })
  });
}

const db = admin.firestore();

async function cancelUserSubscription(userId) {
  try {
    if (!userId) {
      console.log('Usage: node scripts/cancel-subscription.js YOUR_USER_ID');
      console.log('\nThis will:');
      console.log('1. Reset user to free plan');
      console.log('2. Clear subscription data');
      console.log('3. Set wallet to 30 minutes (free plan default)');
      return;
    }

    console.log(`🔄 Canceling subscription for user: ${userId}`);
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log('❌ User not found');
      return;
    }

    const userData = userDoc.data();
    
    console.log('📊 Current user data:');
    console.log(`- Email: ${userData.email}`);
    console.log(`- Subscription Status: ${userData.subscriptionStatus}`);
    console.log(`- Current Wallet Minutes: ${userData.walletMinutes}`);
    console.log(`- Stripe Customer ID: ${userData.stripeCustomerId}`);
    console.log(`- Subscription ID: ${userData.subscriptionId}`);
    
    // Reset user to free plan
    await db.collection('users').doc(userId).update({
      subscriptionStatus: 'free',
      subscriptionId: null,
      walletMinutes: 30, // Reset to free plan minutes
      monthlyMinuteAllocation: null, // Remove monthly allocation
      lastMonthlyReset: null, // Remove reset tracking
      canceledAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('✅ Successfully canceled subscription:');
    console.log('- Subscription Status: free');
    console.log('- Wallet Minutes: 30 (free plan)');
    console.log('- Monthly Allocation: removed');
    console.log('- Subscription ID: cleared');
    
    console.log('\n🎯 Next steps:');
    console.log('1. Refresh your profile page');
    console.log('2. Go to /pricing and upgrade again');
    console.log('3. Complete checkout to test 100 minute allocation');
    
  } catch (error) {
    console.error('❌ Error canceling subscription:', error);
  } finally {
    process.exit(0);
  }
}

// Get user ID from command line
const userId = process.argv[2];
cancelUserSubscription(userId);
