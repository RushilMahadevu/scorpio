// Simple singleton helper for firebase-admin
//
// CRITICAL: We use eval('require') here because the Next.js Turbopack engine
// (which is currently used by default for Next.js 16 in Firebase Hosting)
// incorrectly rewrites 'firebase-admin' as a hashed module ID like
// "firebase-admin-a14c8a5423a75469" at build-time.
//
// Using eval('require') completely hides this from the build system's static
// analysis, ensuring it remains as a standard Node.js require('firebase-admin')
// at runtime, which Cloud Run can resolve successfully.

// Type imports are safe — they are removed during the build and do not trigger hashing bugs.
import type { firestore } from 'firebase-admin';
import type { auth } from 'firebase-admin';
import type { app } from 'firebase-admin';

// Re-export type for external use
export type { firestore, auth, app };

// eslint-disable-next-line @typescript-eslint/no-require-imports
const getAdminModule = () => {
  if (typeof window !== 'undefined') return null;
  // Use eval to avoid static analysis
  return eval('require')('firebase-admin');
};

let _app: app.App | null = null;

function getApp(): app.App | null {
  const admin = getAdminModule();
  if (!admin) return null;

  if (admin.apps.length > 0) {
    return admin.apps[0];
  }
  if (_app) return _app;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"|"$/g, '')
    : undefined;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('[firebase-admin] Missing Firebase Admin credentials.');
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
export const adminDb: firestore.Firestore = new Proxy({} as firestore.Firestore, {
  get: (_, prop) => {
    const admin = getAdminModule();
    const app = getApp();
    if (!admin || !app) return undefined;
    const service = admin.firestore(app);
    const value = (service as any)[prop];
    return typeof value === 'function' ? value.bind(service) : value;
  }
});

export const adminAuth: auth.Auth = new Proxy({} as auth.Auth, {
  get: (_, prop) => {
    const admin = getAdminModule();
    const app = getApp();
    if (!admin || !app) return undefined;
    const service = admin.auth(app);
    const value = (service as any)[prop];
    return typeof value === 'function' ? value.bind(service) : value;
  }
});

// Using a Proxy for FieldValue as well to lazy-load its static methods.
export const adminFieldWithValue: typeof firestore.FieldValue = new Proxy({} as typeof firestore.FieldValue, {
  get: (_, prop) => {
    const admin = getAdminModule();
    if (!admin) return undefined;
    const FV = admin.firestore.FieldValue;
    const value = (FV as any)[prop];
    return typeof value === 'function' ? value.bind(FV) : value;
  }
});
