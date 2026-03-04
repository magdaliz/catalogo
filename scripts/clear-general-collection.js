const admin = require("firebase-admin");
const { FieldPath } = require("firebase-admin/firestore");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const PAGE_SIZE = 400;

function normalize(value) {
  return String(value || "").trim();
}

function isGeneral(value) {
  const normalized = normalize(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return normalized === "general";
}

async function run() {
  let lastDoc = null;
  let updated = 0;

  while (true) {
    let q = db
      .collection("productos")
      .orderBy(FieldPath.documentId())
      .limit(PAGE_SIZE);
    if (lastDoc) q = q.startAfter(lastDoc);

    const snap = await q.get();
    if (snap.empty) break;

    const batch = db.batch();
    snap.docs.forEach((docSnap) => {
      const coleccion = docSnap.data().coleccion;
      if (isGeneral(coleccion)) {
        batch.update(docSnap.ref, { coleccion: "" });
        updated += 1;
      }
    });

    await batch.commit();
    lastDoc = snap.docs[snap.docs.length - 1];
    console.log(`Procesados: ${updated} productos actualizados`);
  }

  console.log(`Listo. Total con coleccion "General" limpiada: ${updated}`);
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error limpiando coleccion General:", error);
    process.exit(1);
  });
