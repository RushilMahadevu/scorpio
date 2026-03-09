// Simple singleton helper for firebase-admin
import * as admin from 'firebase-admin';

let _app: admin.app.App | null = null;

function getApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }
  if (_app) return _app;

  const projectId = process.env.FIREBASE_PROJECT_ID || 'scorpio-srs';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-p19st@scorpio-srs.iam.gserviceaccount.com';
  // Hardcode for diagnostic if environment is failing
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDE3AIGqgarN48c
GMWHXBJUivKULsivRwdAE7pjYJ2lglb+JK3xMgjVZOjbaHC9zGYxE05Cg2u0+qd/
WDOJG9OAMOZpR1L2bBw+U4llrGZqVxX042eh775CN5F4bBtTSOkvQiI+jRMF5dPL
GqscN+GoV/y8R2r1lz7jpvay1xz5UFoil0vBQtAF0/1gApvV4nzOvnte6IcvB9Ia
SrmSg62yy01NLSBj8csYNKucoAbJCoVD13Ld6CupIBaWV5sEAInKE1NNxbHv4J4a
+ZZIZU6V9bLYiGF6QpBo/MC6KAb8AyN0YCeMsnvoTzr8FF/O9UU+6ncfJpIarY9X
00kiz/y/AgMBAAECggEAYFCmGx2X+rBJr/z8s9/bxgpfahnDrWIqjXK5iEKujtpI
9rn6cp5AzSs8dJDSTEJTo2InMYq8KUVTqw371PLM1ZTXPp4bXJ6DaQkVGa4yQ4gN
IY4bV5MFOr+WSF1YNzTehfUs7P631nReXapUGo/Ks8Msz+9/SN5xcg9v9wshTWbj
griZhRFF7i9YQuCBaRBTMqwSx/HDNVwYrDDrFvYumedHN6XEqE6PKfPqk/TF3pDx
YIbqOTAWTMenc1lHrAeA8Cqtnpxjf02Y048l8LaSLkO7J6XtanuT9OwwC+t8XJ3y
hYLY+E7FOkShl9LEpSxhIs2phywLqB6u7wA9Qm6goQKBgQDpkox8PNJwEPWHLokf
nFEW/6IEWm6YZ4u4xMnszUPKQkIWCPbcOYPR/hRVfdKKXWE2sEko7Hac1t8CaGFn
o0RP2xq+lF3QHY9+Y1Olg3kBB3TsCuKsfFpo9C9G8n3MT7aq5XbeYNQXqbIO5a3Y
NnBY2O7F9EOIzNvkjtWYDEhlYQKBgQDXwwO9K0KnridAXCiLzQlt/hglX7hUadTC
jwCj1HoI5DQtpoKM0ZZAibiCaoLiwnKrZcUPeOBJbBizzkbYkgfOZJO40jg+yeOd
lyVbDlzpruscY0TgrjQcCQfcvVdtA8aitamGyCz9Ju5KMfdPYrMTcC8pYvQJEzr6
eqCnN/F2HwKBgBikL1IEEKdmAqEqVakSErP8cBlJeRV3BxSNHkhvN1GlP9eXRoPh
RXjn9zk1tvqF83WTj4RTvge523kjjfMjFFfgY6freyIznCnXTMHPZvqm0Lz+QP+1
dsxPxpUTjBX76ueIocvAJ1//tRtBO9/tjlixOi+EH4PVKPWp4/rQgOrBAoGBAKK2
B4jOKfsoI6OunEkpe/X+DBmLQQgvs2pxy2rBXrJ73jma+5LUr7nF4mY/iqsVNsK5
Ac40OvhD07EtW1IRdl+Yi6pypkX7nHKIvHwZrcnwxo9m8Vd7KAMIcGxwQZENquuj
kc/5/6t9g3Bik/3DEgcTsA1G+YAqh2zDs4nHb4nDAoGBAKZGOtHMRzOkTnCiZNiA
h857g0fO4n7Gv9jmVYWOeOGhaz6X3MntQPPzqOcc2WKcmkAE+jlTDcLFnZzvKvfB
F8sI1smwlwc/uKSrNL1qyJvHScEU92HGnBgQVs1CrWllvoHAc2F2y++0apDX2cSi
/x/qXf5iOoR8imKIYLUfN1lk
-----END PRIVATE KEY-----`).replace(/\\n/g, '\n').replace(/^"|"$/g, '');

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
