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
      // Foolproof Private Key Formatter
      let formattedKey = privateKey;
      
      // 1. Remove surrounding quotes if they exist
      if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
        formattedKey = formattedKey.slice(1, -1);
      } else if (formattedKey.startsWith("'") && formattedKey.endsWith("'")) {
        formattedKey = formattedKey.slice(1, -1);
      }

      // 2. Replace escaped literal \n or \\n with actual newlines
      formattedKey = formattedKey.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');

      // 3. Rebuild the PEM if Hostinger stripped newlines and replaced them with spaces
      const beginMarker = '-----BEGIN PRIVATE KEY-----';
      const endMarker = '-----END PRIVATE KEY-----';
      
      // If it doesn't have proper newlines but has the markers, rebuild it completely
      if (!formattedKey.includes('\n') && formattedKey.includes(beginMarker) && formattedKey.includes(endMarker)) {
        const base64Part = formattedKey
          .replace(beginMarker, '')
          .replace(endMarker, '')
          .replace(/\s+/g, ''); // Strip all remaining spaces or whitespace
          
        // Reconstruct valid PEM format
        // The regex splits the base64 string into chunks of 64 characters (standard PEM line length)
        const matchedChunks = base64Part.match(/.{1,64}/g);
        if (matchedChunks) {
          formattedKey = `${beginMarker}\n${matchedChunks.join('\n')}\n${endMarker}\n`;
        } else {
          formattedKey = `${beginMarker}\n${base64Part}\n${endMarker}\n`;
        }
      }

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
