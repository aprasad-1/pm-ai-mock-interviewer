// Update your current user from unlimited to monthly system
// Run with: node scripts/update-user-to-monthly.js YOUR_USER_ID

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

async function updateUserToMonthly(userId) {
  try {
    if (!userId) {
      console.log('Usage: node scripts/update-user-to-monthly.js YOUR_USER_ID');
      return;
    }

    console.log(`🔄 Updating user ${userId} to monthly system...`);
    
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
    
    if (userData.subscriptionStatus === 'active') {
      // Update to monthly system
      await db.collection('users').doc(userId).update({
        walletMinutes: 100, // Set to 100 minutes
        monthlyMinuteAllocation: 100, // Track monthly allocation
        lastMonthlyReset: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log('✅ Updated user to monthly system:');
      console.log('- Wallet Minutes: 100');
      console.log('- Monthly Allocation: 100');
      console.log('- Last Reset: Now');
    } else {
      console.log('⚠️ User is not on active subscription, no update needed');
    }
    
  } catch (error) {
    console.error('❌ Error updating user:', error);
  } finally {
    process.exit(0);
  }
}

// Get user ID from command line
const userId = process.argv[2];
updateUserToMonthly(userId);
