import { database } from "../applications/database.js";
import { JOURNAL_COLLECTION } from "../constants/journal-constant.js";
import { USER_COLLECTION, USER_FIELDS } from "../constants/user-constant.js";

const save = async (journalData) => {
    const batch = database.batch();

    const journalRef = database.collection(JOURNAL_COLLECTION).doc(journalData.id);
    batch.set(journalRef, journalData);

    const userRef = database.collection(USER_COLLECTION).doc(journalData.user_id);
    batch.update(userRef, {
        [USER_FIELDS.LAST_ENTRY]: journalData.created_at,
        [USER_FIELDS.LAST_JOURNAL_ID]: journalData.id,
        [USER_FIELDS.LAST_JOURNAL_SUMMARY]: journalData.summary || null,
        [USER_FIELDS.LAST_JOURNAL_EMOTION]: journalData.emotion || null
    });

    await batch.commit();
};

const update = async (journalId, updates) => {
    await database.collection("journals").doc(journalId).update(updates);
};

const findById = async (journalId) => {
    const doc = await database.collection("journals").doc(journalId).get();
    if (!doc.exists) return null;
    return doc.data();
};

const deleteById = async (journalId) => {
    await database.collection("journals").doc(journalId).delete();
};

const find = async (userId, filters = {}, sort = "desc", limitCount = null) => {
    let query = database.collection("journals").where("user_id", "==", userId);

    if (filters.is_draft !== undefined) query = query.where("is_draft", "==", filters.is_draft);
    if (filters.is_favorite !== undefined) query = query.where("is_favorite", "==", filters.is_favorite);
    if (filters.start_date) query = query.where("created_at", ">=", filters.start_date);
    if (filters.end_date) query = query.where("created_at", "<=", filters.end_date);

    if (sort) query = query.orderBy("created_at", sort);
    if (limitCount) query = query.limit(limitCount);

    const snapshot = await query.get();
    const data = [];
    if (!snapshot.empty) snapshot.forEach(doc => data.push(doc.data()));
    return data;
};

export default { save, update, findById, deleteById, find };