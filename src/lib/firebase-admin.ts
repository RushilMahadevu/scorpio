// Simple singleton helper for firebase-admin
import * as admin from 'firebase-admin';

let _app: admin.app.App | null = null;

function getApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }
  if (_app) return _app;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Handle both escaped newlines and potential surrounding quotes
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"|"$/g, '')
    : undefined;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('[firebase-admin] Missing Firebase Admin credentials in environment variables.');
    throw new Error('Missing Firebase Admin credentials');
  }

  console.log('[firebase-admin] Initializing with Project:', projectId);

  try {
    _app = admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      projectId,
    });
    console.log('[firebase-admin] initialized successfully.');
    return _app;
  } catch (e: any) {
    if (/already exists/.test(e.message)) {
      return admin.app();
    }
    console.error('[firebase-admin] initialization failed:', e);
    throw e;
  }
}

/**
 * Lazy getters for Firebase Admin services.
 */
export const adminDb: admin.firestore.Firestore = new Proxy({} as admin.firestore.Firestore, {
  get: (_, prop) => {
    const app = getApp();
    const service = admin.firestore(app || undefined);
    const value = (service as any)[prop];
    return typeof value === 'function' ? value.bind(service) : value;
  }
});

export const adminAuth: admin.auth.Auth = new Proxy({} as admin.auth.Auth, {
  get: (_, prop) => {
    const app = getApp();
    const service = admin.auth(app || undefined);
    const value = (service as any)[prop];
    return typeof value === 'function' ? value.bind(service) : value;
  }
});

export const adminFieldWithValue = admin.firestore.FieldValue;
