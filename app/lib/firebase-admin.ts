
import admin from 'firebase-admin';

// This function ensures that the Firebase Admin SDK is initialized only once.
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // For local development, use separate environment variables.
  if (projectId && clientEmail && privateKey) {
    try {
        // The private key might be wrapped in quotes, which we need to remove.
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.substring(1, privateKey.length - 1);
        }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          // The private key's newlines must be un-escaped.
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      console.log("Firebase Admin SDK initialized using separate environment variables.");
      return; // Exit after successful initialization
    } catch (error: any) {
      console.error("Firebase Admin SDK initialization from env vars failed:", error.message);
    }
  }

  // For deployed environments, use Application Default Credentials.
  // This will automatically use the service account from the App Hosting environment.
  try {
    admin.initializeApp({
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    console.log("Firebase Admin SDK initialized using Application Default Credentials.");
  } catch (error: any) {
    console.error("Firebase Admin SDK initialization from ADC failed:", error.message);
  }
}

// Initialize the SDK.
initializeFirebaseAdmin();

// Export the services. They will be null if initialization failed.
const adminDB = admin.apps.length ? admin.firestore() : null;
const adminStorage = admin.apps.length ? admin.storage().bucket() : null;

export { admin, adminDB, adminStorage };
