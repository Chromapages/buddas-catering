// src/lib/firebase/admin.ts
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('Firebase Admin Initialization: Missing one or more required environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). Client-side features may still work, but admin features will fail.');
    } else {
      // 1. Remove surrounding quotes if they exist (frequent issue in Hostinger/Vercel)
      let formattedKey = privateKey;
      if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
        formattedKey = formattedKey.slice(1, -1);
      } else if (formattedKey.startsWith("'") && formattedKey.endsWith("'")) {
        formattedKey = formattedKey.slice(1, -1);
      }

      // 2. Replace escaped newlines with actual newlines
      formattedKey = formattedKey.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedKey,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
      console.log('Firebase Admin Initialized successfully.');
    }
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

// Ensure the app doesn't crash on import if initialization failed.
// (Features rely on these will still throw when used, but the server will start).
export const db = admin.apps.length ? admin.firestore() : ({} as admin.firestore.Firestore);
export const auth = admin.apps.length ? admin.auth() : ({} as admin.auth.Auth);
export const storage = admin.apps.length ? admin.storage() : ({} as admin.storage.Storage);
