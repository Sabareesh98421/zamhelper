import * as admin from 'firebase-admin';

function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
    };

    // verbose logging for debugging
    const missingKeys = [];
    if (!serviceAccount.projectId) missingKeys.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    if (!serviceAccount.clientEmail) missingKeys.push('FIREBASE_CLIENT_EMAIL');
    if (!serviceAccount.privateKey) missingKeys.push('FIREBASE_PRIVATE_KEY');

    if (missingKeys.length > 0) {
        console.error(`Firebase admin credentials are not completely set. Missing: ${missingKeys.join(', ')}. Skipping initialization.`);
        return null;
    }

    try {
        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId: serviceAccount.projectId,
                clientEmail: serviceAccount.clientEmail,
                privateKey: serviceAccount.privateKey ? serviceAccount.privateKey.replace(/\\n/g, '\n') : '',
            }),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
    } catch (error) {
        console.error('Firebase admin initialization error', error);
        return null;
    }
}

const app = initializeFirebaseAdmin();
const adminStorage = app ? admin.storage() : null;

export { adminStorage };
