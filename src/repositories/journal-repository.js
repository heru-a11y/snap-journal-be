import { database } from "../applications/database.js";
import { JOURNAL_COLLECTION } from "../constants/journal-constant.js";
import { USER_COLLECTION, USER_FIELDS } from "../constants/user-constant.js";

const MEDIA_COLLECTION = "journal_media";

const save = async (journalData, mediaList = []) => {
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

    mediaList.forEach(media => {
        const mediaRef = database.collection(MEDIA_COLLECTION).doc(media.id);
        batch.set(mediaRef, media);
    });

    await batch.commit();
};

const update = async (journalId, updates, newMediaList = [], deleteMediaIds = []) => {
    const batch = database.batch();

    if (Object.keys(updates).length > 0) {
        const journalRef = database.collection(JOURNAL_COLLECTION).doc(journalId);
        batch.update(journalRef, updates);
    }

    newMediaList.forEach(media => {
        const mediaRef = database.collection(MEDIA_COLLECTION).doc(media.id);
        batch.set(mediaRef, media);
    });

    deleteMediaIds.forEach(id => {
        const mediaRef = database.collection(MEDIA_COLLECTION).doc(id);
        batch.delete(mediaRef);
    });

    await batch.commit();
};

const findById = async (journalId) => {
    const doc = await database.collection(JOURNAL_COLLECTION).doc(journalId).get();
    if (!doc.exists) return null;
    
    const journal = doc.data();
    
    const mediaSnapshot = await database.collection(MEDIA_COLLECTION).where("journal_id", "==", journalId).get();
    const media = [];
    if (!mediaSnapshot.empty) {
        mediaSnapshot.forEach(m => media.push(m.data()));
    }
    
    journal.media = media; 
    return journal;
};

const deleteById = async (journalId) => {
    const batch = database.batch();
    
    const journalRef = database.collection(JOURNAL_COLLECTION).doc(journalId);
    batch.delete(journalRef);

    const mediaSnapshot = await database.collection(MEDIA_COLLECTION).where("journal_id", "==", journalId).get();
    mediaSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
};

const find = async (userId, filters = {}, sort = "desc", limitCount = null) => {
    let query = database.collection(JOURNAL_COLLECTION).where("user_id", "==", userId);

    if (filters.is_draft !== undefined) query = query.where("is_draft", "==", filters.is_draft);
    if (filters.is_favorite !== undefined) query = query.where("is_favorite", "==", filters.is_favorite);
    if (filters.start_date) query = query.where("created_at", ">=", filters.start_date);
    if (filters.end_date) query = query.where("created_at", "<=", filters.end_date);

    if (sort) query = query.orderBy("created_at", sort);
    if (limitCount) query = query.limit(limitCount);

    const snapshot = await query.get();
    if (snapshot.empty) return [];

    const journals = [];
    snapshot.forEach(doc => journals.push(doc.data()));

    return await Promise.all(journals.map(async (journal) => {
        const mediaSnapshot = await database.collection(MEDIA_COLLECTION)
            .where("journal_id", "==", journal.id)
            .get();
            
        const media = [];
        mediaSnapshot.forEach(m => media.push(m.data()));
        
        return { ...journal, media };
    }));
};

export default { save, update, findById, deleteById, find };