import { getFirestore } from "firebase-admin/firestore";
import { firebaseApp } from "./firebase.js";
import { logger } from "./logging.js";

const database = getFirestore(firebaseApp, "snapjournal-nodejs-database");

try {
    if (database) {
        logger.info("Firestore Database Client ready");
    } else {
        throw new Error("Firestore instance is undefined");
    }
} catch (error) {
    logger.error(`Database Setup Error: ${error.message}`);
}

export { database };