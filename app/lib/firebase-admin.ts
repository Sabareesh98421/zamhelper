
import admin from 'firebase-admin';

// Check if the service account is already available
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  : null;

// Initialize the Firebase Admin SDK only if it hasn't been initialized yet
// and if the service account credentials are provided.
if (!admin.apps.length && serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    console.error("Firebase Admin SDK initialization error:", error.message);
  }
}

// Ensure that we export a valid admin object, even if initialization fails.
// The code using this import should handle the case where services are not available.
const adminDB = admin.apps.length ? admin.firestore() : null;
const adminStorage = admin.apps.length ? admin.storage().bucket() : null;

export { admin, adminDB, adminStorage };
