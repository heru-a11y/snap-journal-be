import { database } from "../applications/database.js";
import { USER_COLLECTION } from "../constants/user-constant.js";
import { 
    NOTIFICATION_COLLECTION, 
    NOTIFICATION_FIELDS, 
    NOTIFICATION_QUERY 
} from "../constants/notification-constant.js";

const getCollection = (userId) => {
    return database.collection(USER_COLLECTION).doc(userId).collection(NOTIFICATION_COLLECTION);
};

const create = async (userId, notificationId, data) => {
    await getCollection(userId).doc(notificationId).set(data);
};

const findByUserId = async (userId, limit) => {
    return await getCollection(userId)
        .orderBy(NOTIFICATION_FIELDS.CREATED_AT, NOTIFICATION_QUERY.ORDER_DESC)
        .limit(limit)
        .get();
};

const findById = async (userId, id) => {
    return await getCollection(userId).doc(id).get();
};

const updateReadStatus = async (userId, id, now) => {
    await getCollection(userId).doc(id).update({
        [NOTIFICATION_FIELDS.READ_AT]: now,
        [NOTIFICATION_FIELDS.UPDATED_AT]: now
    });
};

const deleteBatchByUserId = async (userId) => {
    const collectionRef = getCollection(userId);
    let totalDeleted = 0;

    while (true) {
        const snapshot = await collectionRef.limit(500).get();
        if (snapshot.empty) break;

        const batch = database.batch();
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        
        totalDeleted += snapshot.size;
        if (snapshot.size < 500) break;
    }
    
    return totalDeleted > 0;
};

const deleteById = async (userId, id) => {
    await getCollection(userId).doc(id).delete();
};

export default {
    findByUserId,
    findById,
    updateReadStatus,
    deleteBatchByUserId,
    deleteById,
    create
};