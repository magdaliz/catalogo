const admin = require("firebase-admin");
const { FieldPath } = require("firebase-admin/firestore");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const COLLECTION_NAME = "productos";
const PAGE_SIZE = 400;
const OFFER_PERCENT = 25; // aprox 25% en oferta
const OFFER_LEVELS = [10, 15, 20, 25, 30]; // descuentos posibles

function hashStringToInt(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

async function run() {
  let lastDoc = null;
  let total = 0;
  let withOffer = 0;
  let withoutOffer = 0;

  while (true) {
    let q = db
      .collection(COLLECTION_NAME)
      .orderBy(FieldPath.documentId())
      .limit(PAGE_SIZE);
    if (lastDoc) q = q.startAfter(lastDoc);

    const snap = await q.get();
    if (snap.empty) break;

    const batch = db.batch();

    snap.docs.forEach((docSnap) => {
      const seed = hashStringToInt(docSnap.id);
      const hasOffer = seed % 100 < OFFER_PERCENT;
      const discount = hasOffer ? OFFER_LEVELS[seed % OFFER_LEVELS.length] : 0;

      batch.update(docSnap.ref, { descuento: discount });

      if (hasOffer) withOffer += 1;
      else withoutOffer += 1;
    });

    await batch.commit();
    total += snap.size;
    lastDoc = snap.docs[snap.docs.length - 1];
    console.log(
      `Actualizados: ${total} | con dcto: ${withOffer} | sin dcto: ${withoutOffer}`,
    );
  }

  console.log("Listo.");
  console.log(`Total docs: ${total}`);
  console.log(`Con descuento: ${withOffer}`);
  console.log(`Sin descuento: ${withoutOffer}`);
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

