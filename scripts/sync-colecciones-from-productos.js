const admin = require("firebase-admin");
const { FieldPath } = require("firebase-admin/firestore");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
let bucket = null;

function resolveBucketName() {
  const fromEnv =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (fromEnv && String(fromEnv).trim()) return String(fromEnv).trim();

  // FallBack comunes en Firebase projects.
  if (serviceAccount.project_id) {
    return `${serviceAccount.project_id}.firebasestorage.app`;
  }
  return "";
}

function resolveBucketCandidates() {
  const fromEnv =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (fromEnv && String(fromEnv).trim()) return [String(fromEnv).trim()];

  if (!serviceAccount.project_id) return [];
  return [
    `${serviceAccount.project_id}.firebasestorage.app`,
    `${serviceAccount.project_id}.appspot.com`,
  ];
}

function getBucketSafe() {
  if (bucket) return bucket;
  const candidates = resolveBucketCandidates();
  for (const bucketName of candidates) {
    if (!bucketName) continue;
    try {
      const candidate = admin.storage().bucket(bucketName);
      bucket = candidate;
      return bucket;
    } catch {
      // Probar siguiente candidato sin romper la sincronizacion.
    }
  }
  return null;
}

const PRODUCTOS_COLLECTION = "productos";
const COLECCIONES_COLLECTION = "colecciones";
const PAGE_SIZE = 400;

const DESCRIPTION_MAP = {
  navidad:
    "Coleccion inspirada en la temporada navidena, ideal para regalos y decoracion especial.",
  halloween:
    "Coleccion tematica de Halloween con piezas creativas y detalles unicos hechos a mano.",
  colombia:
    "Coleccion inspirada en Colombia, con colores y elementos representativos de nuestra identidad.",
  flores:
    "Coleccion floral con disenos delicados para un estilo fresco, alegre y femenino.",
  personalizados:
    "Coleccion personalizable para crear accesorios a tu gusto, con nombres, colores o tematicas.",
  resina:
    "Coleccion en resina artesanal con acabados unicos, ligeros y resistentes.",
  "amor-y-amistad":
    "Coleccion pensada para celebrar el amor y la amistad con detalles hechos a mano.",
  construccion:
    "Coleccion inspirada en construccion, ideal para regalos creativos y tematicos.",
  superheroes:
    "Coleccion inspirada en superheroes, con piezas divertidas y personalizadas.",
};

function normalizeName(value) {
  return String(value || "").trim();
}

function slugify(value) {
  return normalizeName(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getCollectionDescription(nombre) {
  const slug = slugify(nombre);
  return (
    DESCRIPTION_MAP[slug] ||
    `Coleccion ${nombre} con accesorios artesanales hechos a mano en Colombia.`
  );
}

function isGeneralCollection(name) {
  const slug = slugify(name);
  return slug === "general";
}

async function clearGeneralFromProducts() {
  let lastDoc = null;
  let updated = 0;

  while (true) {
    let q = db
      .collection(PRODUCTOS_COLLECTION)
      .orderBy(FieldPath.documentId())
      .limit(PAGE_SIZE);
    if (lastDoc) q = q.startAfter(lastDoc);

    const snap = await q.get();
    if (snap.empty) break;

    const batch = db.batch();
    snap.docs.forEach((docSnap) => {
      const coleccion = normalizeName(docSnap.data().coleccion);
      if (coleccion && isGeneralCollection(coleccion)) {
        batch.update(docSnap.ref, { coleccion: "" });
        updated += 1;
      }
    });

    await batch.commit();
    lastDoc = snap.docs[snap.docs.length - 1];
  }

  return updated;
}

async function collectCollectionsFromProducts() {
  let lastDoc = null;
  const names = new Set();

  while (true) {
    let q = db
      .collection(PRODUCTOS_COLLECTION)
      .orderBy(FieldPath.documentId())
      .limit(PAGE_SIZE);
    if (lastDoc) q = q.startAfter(lastDoc);

    const snap = await q.get();
    if (snap.empty) break;

    snap.docs.forEach((docSnap) => {
      const coleccion = normalizeName(docSnap.data().coleccion);
      if (!coleccion || isGeneralCollection(coleccion)) return;
      names.add(coleccion);
    });

    lastDoc = snap.docs[snap.docs.length - 1];
  }

  return Array.from(names).sort();
}

async function ensureStorageFolderForCollection(nombre) {
  const safeBucket = getBucketSafe();
  if (!safeBucket) return;
  const slug = slugify(nombre);
  const file = safeBucket.file(`colecciones/${slug}/README.txt`);
  const [exists] = await file.exists();
  if (!exists) {
    await file.save(`Coleccion: ${nombre}\n`, {
      contentType: "text/plain; charset=utf-8",
      resumable: false,
      metadata: { cacheControl: "no-cache" },
    });
  }
}

async function upsertCollectionsDocs(collectionNames) {
  for (const nombre of collectionNames) {
    const slug = slugify(nombre);
    const descripcion = getCollectionDescription(nombre);

    const ref = db.collection(COLECCIONES_COLLECTION).doc(slug);
    const existing = await ref.get();

    await ref.set(
      {
        nombre,
        slug,
        descripcion,
        activa: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        ...(existing.exists
          ? {}
          : { createdAt: admin.firestore.FieldValue.serverTimestamp() }),
      },
      { merge: true },
    );

    await ensureStorageFolderForCollection(nombre);
  }
}

async function run() {
  const safeBucket = getBucketSafe();
  const storageEnabled = Boolean(safeBucket);
  if (!storageEnabled) {
    console.log(
      "Aviso: no hay bucket configurado. Se sincronizara Firestore y se omitira Storage.",
    );
  } else {
    console.log(`Storage activo con bucket: ${safeBucket.name}`);
  }

  console.log("1) Limpiando 'General' de productos...");
  const generalCleaned = await clearGeneralFromProducts();
  console.log(`   Productos actualizados (General -> vacio): ${generalCleaned}`);

  console.log("2) Derivando colecciones desde productos...");
  const collectionNames = await collectCollectionsFromProducts();
  console.log(`   Colecciones detectadas: ${collectionNames.length}`);
  collectionNames.forEach((name) => console.log(`   - ${name}`));

  console.log("3) Creando/actualizando docs de colecciones...");
  await upsertCollectionsDocs(collectionNames);

  console.log("Listo. Sincronizacion completada.");
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error en sync-colecciones-from-productos:", error);
    process.exit(1);
  });
