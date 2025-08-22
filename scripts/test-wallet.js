// Quick wallet testing script
// Run with: node scripts/test-wallet.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need your service account key)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      // Add your Firebase service account credentials here
      projectId: "your-project-id",
      clientEmail: "your-client-email",
      privateKey: "your-private-key"
    })
  });
}

const db = admin.firestore();

async function setUserWalletMinutes(userId, minutes) {
  try {
    await db.collection('users').doc(userId).update({
      walletMinutes: minutes,
      updatedAt: new Date().toISOString()
    });
    console.log(`✅ Set wallet to ${minutes} minutes for user ${userId}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Usage examples:
// setUserWalletMinutes('your-user-id', 0);   // Test depletion
// setUserWalletMinutes('your-user-id', 1);   // Test critical
// setUserWalletMinutes('your-user-id', 30);  // Reset to normal

module.exports = { setUserWalletMinutes };
