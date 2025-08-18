import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Debug: Log the private key format (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase Admin Config:', {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length,
    privateKeyStart: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50),
    privateKeyEnd: process.env.FIREBASE_PRIVATE_KEY?.substring(-50),
  });
}

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/\\r\\n/g, '\n'),
  }),
};

// Initialize Firebase Admin (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

// Initialize Firebase Admin Auth and get a reference to the service
export const adminAuth = getAuth(app);

// Initialize Firebase Admin Firestore and get a reference to the service
export const adminDb = getFirestore(app);

export default app;
