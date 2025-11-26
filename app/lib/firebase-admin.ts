import admin from 'firebase-admin';

// Initialize Firebase Admin SDK.
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;

  // Use the private storage bucket environment variable, but fall back to the project ID
  // to ensure the application builds successfully in all environments.
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: storageBucket,
  });

  console.log('Firebase Admin SDK initialized successfully.');
}

const adminDB = admin.firestore();
const adminStorage = admin.storage().bucket();

export { admin, adminDB, adminStorage };
