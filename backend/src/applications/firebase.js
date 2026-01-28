import admin from 'firebase-admin';
import { createRequire } from 'module'; 
import dotenv from 'dotenv';
import { logger } from "./logging.js"; 

dotenv.config();

const require = createRequire(import.meta.url);
let serviceAccount;

try {
    serviceAccount = require('../../service-account-key.json');
} catch (error) {
    logger.error("Gagal memuat service-account-key.json. Pastikan file ada di root folder.");
    process.exit(1);
}

const firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_BUCKET_NAME
});

const db = admin.firestore();
const storage = admin.storage();
const messaging = admin.messaging();

logger.info("Firebase Connected Successfully");

export { admin, db, storage, messaging, firebaseApp };