import { database } from "../applications/database.js";
import { FEELING_CONSTANTS } from "../constants/feeling-constant.js";

const getFeelingCollection = (uid) => {
    return database.collection(FEELING_CONSTANTS.COLLECTION.USERS).doc(uid).collection(FEELING_CONSTANTS.COLLECTION.FEELINGS);
};

const saveFeeling = async (uid, date, data) => {
    await getFeelingCollection(uid).doc(date).set(data, { merge: true });
};

const getFeelingByDate = async (uid, date) => {
    const doc = await getFeelingCollection(uid).doc(date).get();
    if (!doc.exists) {
        return null;
    }
    return doc.data();
};

const getFeelingHistory = async (uid, limitData = FEELING_CONSTANTS.QUERY.DEFAULT_LIMIT) => {
    const snapshot = await getFeelingCollection(uid)
        .orderBy(FEELING_CONSTANTS.FIELD.DATE, FEELING_CONSTANTS.QUERY.SORT_DESC)
        .limit(limitData)
        .get();

    return snapshot.docs.map(doc => doc.data());
};

export default {
    saveFeeling,
    getFeelingByDate,
    getFeelingHistory
};