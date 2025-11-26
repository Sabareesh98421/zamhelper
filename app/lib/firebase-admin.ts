import admin from 'firebase-admin';

// Initialize Firebase Admin SDK.
// This single, unified approach works for both local development and deployed environments
// because App Hosting automatically injects the service account credentials as environment variables.
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    // The storage bucket is derived from the project ID, ensuring it's always correctly configured.
    storageBucket: `${projectId}.appspot.com`,
  });

  console.log('Firebase Admin SDK initialized successfully.');
}

const adminDB = admin.firestore();
const adminStorage = admin.storage().bucket();

export { admin, adminDB, adminStorage };
