const admin = require("firebase-admin");

/*
=========================================================
FIREBASE ADMIN CONFIGURATION
=========================================================
*/

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : null;

/*
=========================================================
VALIDATE ENVIRONMENT VARIABLES
=========================================================
*/

if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !privateKey
) {
  throw new Error(
    "Firebase Admin configuration is missing. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env"
  );
}

/*
=========================================================
INITIALIZE FIREBASE ADMIN

firebase-admin v14 uses admin.cert()
directly.
=========================================================
*/

admin.initializeApp({
  credential: admin.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
});

console.log("Firebase Admin initialized successfully");

module.exports = admin;