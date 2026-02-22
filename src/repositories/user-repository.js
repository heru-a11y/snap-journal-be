import { database } from "../applications/database.js";

const findById = async (userId) => {
    const doc = await database.collection("users").doc(userId).get();
    if (!doc.exists) return null;
    return doc.data();
};

const findByEmail = async (email) => {
    const snapshot = await database.collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();
        
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
};

const update = async (userId, data) => {
    await database.collection("users").doc(userId).update(data);
};

const deleteById = async (userId) => {
    await database.collection("users").doc(userId).delete();
};

const isEmailExists = async (email) => {
    const snapshot = await database.collection("users").where("email", "==", email).get();
    return !snapshot.empty;
};

const create = async (userId, userData) => {
    await database.collection("users").doc(userId).set(userData);
}

export default {
    findById,
    findByEmail,
    update,
    deleteById,
    isEmailExists,
    create
};