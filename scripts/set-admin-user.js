const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

const ADMIN_EMAIL = "magdaliz.mlcr@gmail.com";

async function run() {
  const user = await auth.getUserByEmail(ADMIN_EMAIL);

  await auth.setCustomUserClaims(user.uid, {
    admin: true,
  });

  await db.collection("users").doc(user.uid).set(
    {
      email: ADMIN_EMAIL,
      role: "admin",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  console.log("Admin asignado correctamente:");
  console.log(`email: ${ADMIN_EMAIL}`);
  console.log(`uid: ${user.uid}`);
  console.log("claim admin=true + users/{uid}.role=admin");
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

