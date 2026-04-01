import { adminDb } from "./src/lib/firebase-admin";

async function check() {
  if (!adminDb) {
    console.error("Admin DB not initialized");
    return;
  }
  const snapshot = await adminDb.collection("portfolios").limit(5).get();
  console.log(`Found ${snapshot.size} portfolios`);
  snapshot.forEach(doc => {
    console.log(`Doc ID: ${doc.id}`);
    console.log(`Data: ${JSON.stringify(doc.data(), null, 2)}`);
  });
}

check();
