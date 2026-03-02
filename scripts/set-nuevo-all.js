const admin = require("firebase-admin");
const { FieldPath } = require("firebase-admin/firestore");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function run() {
  let lastDoc = null;
  let total = 0;

  while (true) {
    let q = db.collection("productos").orderBy(FieldPath.documentId()).limit(400);
    if (lastDoc) q = q.startAfter(lastDoc);

    const snap = await q.get();
    if (snap.empty) break;

    const batch = db.batch();
    snap.docs.forEach((doc) => {
      batch.update(doc.ref, { nuevo: true });
    });

    await batch.commit();
    total += snap.size;
    lastDoc = snap.docs[snap.docs.length - 1];
    console.log(`Actualizados: ${total}`);
  }

  console.log(`Listo. Total actualizados: ${total}`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
