import { database } from "../applications/database.js";

/**
 * Menyimpan atau Update Feeling Hari Ini
 * @param {Object} user - User object dari token
 * @param {Object} request - Data mood yang sudah divalidasi (Clean Data)
 */
const setTodayFeeling = async (user, request) => {
    const today = new Date().toISOString().split('T')[0];
    
    const feelingRef = database.collection("users").doc(user.uid)
        .collection("feelings").doc(today);

    const now = new Date().toISOString();

    const data = {
        mood: request.mood,
        date: today,
        created_at: now,
        updated_at: now
    };

    await feelingRef.set(data, { merge: true });

    return {
        date: today,
        mood: request.mood,
        message: "Feeling hari ini berhasil disimpan."
    };
};

/**
 * Cek apakah user sudah mengisi feeling hari ini
 */
const getTodayFeeling = async (user) => {
    const today = new Date().toISOString().split('T')[0];
    
    const feelingRef = database.collection("users").doc(user.uid)
        .collection("feelings").doc(today);
        
    const doc = await feelingRef.get();

    if (!doc.exists) {
        return null; 
    }

    return doc.data();
};

/**
 * Mendapatkan riwayat feeling
 */
const getFeelingHistory = async (user) => {
    const snapshot = await database.collection("users").doc(user.uid)
        .collection("feelings")
        .orderBy("date", "desc")
        .limit(30)
        .get();

    return snapshot.docs.map(doc => doc.data());
};

export default {
    setTodayFeeling,
    getTodayFeeling,
    getFeelingHistory
};