import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// List of allowed collections we expose in the Explorer.
const ALLOWED_COLLECTIONS = [
  'users',
  'organizations',
  'courses',
  'assignments',
  'submissions',
  'practice_history',
  'tutor_sessions',
  'portfolios',
  'teacherInviteCodes',
  'accessRequests',
  'usage',
  'usage_analytics',
  'landing_visitors',
];

export async function POST(req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Service unavailable: Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const adminSecret = req.headers.get('x-admin-secret');
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, collectionName, limit = 50, lastDocId } = body;

    // ─── LIST COLLECTIONS ────────────────────────────────────────────────────
    if (action === 'listCollections') {
      return NextResponse.json({ collections: ALLOWED_COLLECTIONS });
    }

    // ─── QUERY COLLECTION (READ ONLY) ─────────────────────────────────────────
    if (action === 'queryCollection') {
      if (!collectionName || !ALLOWED_COLLECTIONS.includes(collectionName)) {
        return NextResponse.json({ error: 'Invalid or missing collection name' }, { status: 400 });
      }

      let query: FirebaseFirestore.Query = adminDb.collection(collectionName);

      // We default to sorting by a field to ensure stable pagination.
      // Many collections use 'createdAt' but some do not. We can just list by document ID
      // To paginate efficiently by Document ID:
      query = query.orderBy('__name__', 'asc');

      if (lastDocId) {
        // Fetch the cursor doc to start after
        const cursorDoc = await adminDb.collection(collectionName).doc(lastDocId).get();
        if (cursorDoc.exists) {
          query = query.startAfter(cursorDoc);
        }
      }

      const snapshot = await query.limit(Math.min(limit, 100)).get();

      const docs = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        // We ensure any Firestore Timestamps are serialized safely
      }));

      // Safely stringify nested objects/timestamps to handle Next.js JSON serialization
      const safeDocs = JSON.parse(
        JSON.stringify(docs, (key, value) => {
          if (value && typeof value === 'object') {
            if (value._seconds !== undefined && value._nanoseconds !== undefined) {
              return new Date(value._seconds * 1000).toISOString();
            }
          }
          return value;
        })
      );

      return NextResponse.json({
        docs: safeDocs,
        lastDocId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
        hasMore: snapshot.docs.length === limit,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('[admin-firestore] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal error' },
      { status: 500 }
    );
  }
}
