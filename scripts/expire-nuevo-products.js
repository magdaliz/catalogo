const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore();
const PAGE_SIZE = 450;

async function run() {
  const now = admin.firestore.Timestamp.now();
  let total = 0;
  let lastDoc = null;

  while (true) {
    let query = db
      .collection("productos")
      .where("nuevo", "==", true)
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(PAGE_SIZE);
    if (lastDoc) query = query.startAfter(lastDoc);
    const snapshot = await query.get();

    if (snapshot.empty) break;

    const batch = db.batch();
    let expiredInBatch = 0;
    snapshot.docs.forEach((productDoc) => {
      const expiresAt = productDoc.get("nuevoHasta");
      if (!expiresAt || expiresAt > now) return;
      batch.update(productDoc.ref, {
        nuevo: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      expiredInBatch += 1;
      total += 1;
    });
    if (expiredInBatch > 0) await batch.commit();
    lastDoc = snapshot.docs[snapshot.docs.length - 1];
  }

  console.log(`Productos expirados: ${total}`);
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
