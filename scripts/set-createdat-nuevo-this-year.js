const admin = require("firebase-admin");
const { FieldPath } = require("firebase-admin/firestore");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Config
const COLLECTION_NAME = "productos";
const PAGE_SIZE = 400;
const NEW_WINDOW_DAYS = 30; // "nuevo" if createdAt is within the last 30 days
const NEW_PERCENT = 20; // around 20% new, 80% old

function hashStringToInt(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function randomDateBetween(startMs, endMs, seed) {
  if (endMs <= startMs) return new Date(startMs);
  const span = endMs - startMs + 1;
  const offset = seed % span;
  return new Date(startMs + offset);
}

async function run() {
  const now = new Date();
  const currentYear = now.getFullYear();

  const yearStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - NEW_WINDOW_DAYS);

  const oldRangeStartMs = yearStart.getTime();
  const oldRangeEndMs = Math.max(yearStart.getTime(), cutoff.getTime() - 1);
  const newRangeStartMs = Math.max(yearStart.getTime(), cutoff.getTime());
  const newRangeEndMs = now.getTime();

  let lastDoc = null;
  let total = 0;
  let totalNew = 0;
  let totalOld = 0;

  while (true) {
    let q = db.collection(COLLECTION_NAME).orderBy(FieldPath.documentId()).limit(PAGE_SIZE);
    if (lastDoc) q = q.startAfter(lastDoc);

    const snap = await q.get();
    if (snap.empty) break;

    const batch = db.batch();

    snap.docs.forEach((docSnap) => {
      const id = docSnap.id;
      const seed = hashStringToInt(id);
      const isNew = seed % 100 < NEW_PERCENT;

      const date = isNew
        ? randomDateBetween(newRangeStartMs, newRangeEndMs, seed)
        : randomDateBetween(oldRangeStartMs, oldRangeEndMs, seed);

      batch.update(docSnap.ref, {
        createdAt: admin.firestore.Timestamp.fromDate(date),
        nuevo: isNew,
      });

      if (isNew) totalNew += 1;
      else totalOld += 1;
    });

    await batch.commit();
    total += snap.size;
    lastDoc = snap.docs[snap.docs.length - 1];

    console.log(
      `Actualizados: ${total} | nuevos: ${totalNew} | no nuevos: ${totalOld}`,
    );
  }

  console.log("Listo.");
  console.log(`Total docs: ${total}`);
  console.log(`Nuevos: ${totalNew}`);
  console.log(`No nuevos: ${totalOld}`);
  console.log(
    `Rango usado (year ${currentYear}): old=[${yearStart.toISOString()} .. ${new Date(oldRangeEndMs).toISOString()}], new=[${new Date(newRangeStartMs).toISOString()} .. ${now.toISOString()}]`,
  );
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
