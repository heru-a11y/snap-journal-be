import { database } from "../applications/database.js";
import { USER_COLLECTION, USER_FIELDS } from "../constants/user-constant.js";

const findById = async (userId) => {
    const doc = await database.collection(USER_COLLECTION).doc(userId).get();
    if (!doc.exists) return null;
    return doc.data();
};

const findByEmail = async (email) => {
    const snapshot = await database.collection(USER_COLLECTION)
        .where(USER_FIELDS.EMAIL, "==", email)
        .limit(1)
        .get();
        
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
};

const update = async (userId, data) => {
    await database.collection(USER_COLLECTION).doc(userId).update(data);
};

const deleteById = async (userId) => {
    await database.collection(USER_COLLECTION).doc(userId).delete();
};

const isEmailExists = async (email) => {
    const snapshot = await database.collection(USER_COLLECTION)
        .where(USER_FIELDS.EMAIL, "==", email)
        .get();
    return !snapshot.empty;
};

const create = async (userId, userData) => {
    await database.collection(USER_COLLECTION).doc(userId).set(userData);
}

const findInactiveUsers = async (cutoffISO, limitCount = 500, lastDoc = null) => {
    let query = database.collection(USER_COLLECTION)
        .where(USER_FIELDS.LAST_ENTRY, "<", cutoffISO)
        .orderBy(USER_FIELDS.LAST_ENTRY, "asc")
        .limit(limitCount);

    if (lastDoc) {
        query = query.startAfter(lastDoc);
    }

    return await query.get();
};

export default {
    findById,
    findByEmail,
    update,
    deleteById,
    isEmailExists,
    create,
    findInactiveUsers
};