import * as admin from 'firebase-admin';
import type { firestore, auth, app } from 'firebase-admin';

// Re-export type for external use
export type { firestore, auth, app };

let _app: app.App | null = null;

function getApp(): app.App | null {
  if (typeof window !== 'undefined') return null;

  if (admin.apps.length > 0) {
    return admin.apps[0];
  }
  
  if (_app) return _app;

  // Use either FIREBASE_PROJECT_ID or the public one as fallback
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"|"$/g, '')
    : undefined;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('[firebase-admin] Missing credentials:', { 
      hasProjectId: !!projectId, 
      hasClientEmail: !!clientEmail, 
      hasPrivateKey: !!privateKey 
    });
    return null; // Return null instead of throwing to allow routes to handle the error
  }

  console.log('[firebase-admin] Initializing for Project:', projectId);

  try {
    _app = admin.initializeApp({
      credential: admin.credential.cert({ 
        projectId, 
        clientEmail, 
        privateKey 
      }),
      projectId,
    });
    console.log('[firebase-admin] Initialized successfully.');
    return _app;
  } catch (e: any) {
    if (/already exists/.test(e.message)) {
      return admin.app();
    }
    console.error('[firebase-admin] Initialization failed:', e);
    return null;
  }
}

/**
 * Lazy getters for Firebase Admin services.
 */
export const adminDb: firestore.Firestore = new Proxy({} as firestore.Firestore, {
  get: (_, prop) => {
    const app = getApp();
    if (!app) return undefined;
    const service = admin.firestore(app);
    const value = (service as any)[prop];
    return typeof value === 'function' ? value.bind(service) : value;
  }
});

export const adminAuth: auth.Auth = new Proxy({} as auth.Auth, {
  get: (_, prop) => {
    const app = getApp();
    if (!app) return undefined;
    const service = admin.auth(app);
    const value = (service as any)[prop];
    return typeof value === 'function' ? value.bind(service) : value;
  }
});

export const adminFieldWithValue: typeof firestore.FieldValue = new Proxy({} as typeof firestore.FieldValue, {
  get: (_, prop) => {
    const app = getApp();
    if (!app) return undefined;
    const FV = admin.firestore.FieldValue;
    const value = (FV as any)[prop];
    return typeof value === 'function' ? value.bind(FV) : value;
  }
});
