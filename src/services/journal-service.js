import { database } from "../applications/database.js";
import { ResponseError } from "../error/response-error.js";
import { v4 as uuidv4 } from "uuid";
import aiHelperService from "./ai-helper-service.js";
import { stripHtmlTags, extractImageUrls} from "../utils/journal-util.js";
import uploadService from "./upload-service.js";
import deleteService from "./delete-service.js";

/**
 * Membuat Journal Baru (POST /api/v1/journals)
 * @param {Object} user - User yang sedang login (req.user)
 * @param {Object} request - Body request (title, note)
 * @param {Object|null} videoFile - File video dari Multer (req.files['video'])
 */
const createJournal = async (user, request, videoFile) => {
    if (!request.title) {
        throw new ResponseError(400, "Judul jurnal wajib diisi.");
    }

    const journalId = uuidv4();
    const now = new Date().toISOString();
    
    const videoUrl = await uploadService.uploadJournalVideo(user, videoFile);
    
    const cleanNote = stripHtmlTags(request.note || "");     
    const fullTextForAI = `${request.title} . ${cleanNote}`;
    let aiAnalysis = { emotion: null, expression: null, confidence: null };

    try {
        if (fullTextForAI.length > 3) {
            const result = await aiHelperService.analyzeSentiment(fullTextForAI);
            if (result) aiAnalysis = result;
        }
    } catch (e) {
        console.error("AI Analysis Skipped:", e.message);
    }

    const journalData = {
        id: journalId,
        user_id: user.uid,
        title: request.title,
        note: request.note || "",
        video_url: videoUrl,
        emotion: aiAnalysis.emotion,        
        expression: aiAnalysis.expression,  
        confidence: aiAnalysis.confidence,  
        similarity: null, tags: null, illustrator: null, illustrator_urls: null, 
        chatbot_suggestion: null, chatbot_highlight: null, chatbot_strategy: null,   
        created_at: now,
        updated_at: now
    };

    await database.collection("journals").doc(journalId).set(journalData);
    await database.collection("users").doc(user.uid).update({ last_entry: now });

    return journalData;
};

/**
 * Mengambil daftar jurnal (GET /api/v1/journals)
 * Filter Prioritas:
 * 1. Range Tanggal (start_date & end_date)
 * 2. Tanggal Spesifik (date)
 * 3. Bulan & Tahun (month & year) - Default
 * @param {Object} user - User yang sedang login (req.user)
 * @param {Object} request - Query params (request.month, request.year)
 * @returns {Object} - Object berisi 'meta' dan 'data'
 */
const listJournal = async (user, request) => {
    let startDate, endDate;
    let filterType;

    if (request.start_date && request.end_date) {
        filterType = "range";

        startDate = new Date(request.start_date);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(request.end_date);
        endDate.setHours(23, 59, 59, 999);
    }

    else if (request.date) {
        filterType = "date";
        startDate = new Date(request.date);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(request.date);
        endDate.setHours(23, 59, 59, 999);
    }
    else {
        filterType = "monthly";
        const now = new Date();
        const month = request.month ? parseInt(request.month) : now.getMonth() + 1;
        const year = request.year ? parseInt(request.year) : now.getFullYear();
        
        startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
        endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    }

    const journalsRef = database.collection("journals");
    
    const snapshot = await journalsRef
        .where("user_id", "==", user.uid)
        .where("created_at", ">=", startDate.toISOString())
        .where("created_at", "<=", endDate.toISOString())
        .orderBy("created_at", "desc")
        .get();

    const journals = [];
    if (!snapshot.empty) {
        snapshot.forEach(doc => {
            journals.push(doc.data());
        });
    }

    return {
        meta: {
            filter_type: filterType,
            filter_start: startDate.toISOString(),
            filter_end: endDate.toISOString(),
            total_data: journals.length
        },
        data: journals
    };
};

/**
 * Mengambil detail lengkap satu jurnal (GET /api/v1/journals/:id)
 * Termasuk data hasil analisis AI jika sudah tersedia.
 * @param {Object} user - User object dari token
 * @param {String} journalId - ID Jurnal
 */
const getDetailJournal = async (user, journalId) => {
    const docRef = database.collection("journals").doc(journalId);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new ResponseError(404, "Jurnal tidak ditemukan");
    }

    const journalData = doc.data();
    if (journalData.user_id !== user.uid) {
        throw new ResponseError(403, "Anda tidak memiliki akses ke jurnal ini");
    }
    return journalData;
}

/**
 * Mengupdate data jurnal (Teks & Inline Image Cleanup) (PUT /api/v1/journals/:id)
 * @param {Object} user - User object
 * @param {Object} request - Body (title, note)
 * @param {String} journalId - ID Jurnal
 */
const updateJournal = async (user, request, journalId) => {
    const docRef = database.collection("journals").doc(journalId);
    const doc = await docRef.get();

    if (!doc.exists) throw new ResponseError(404, "Jurnal tidak ditemukan");

    const currentData = doc.data();
    if (currentData.user_id !== user.uid) throw new ResponseError(403, "Akses ditolak");

    const now = new Date().toISOString();
    const updates = { updated_at: now };

    if (request.title !== undefined) updates.title = request.title;
    if (request.note !== undefined) updates.note = request.note;

    await docRef.update(updates);
    return { ...currentData, ...updates };
};

/**
 * Menghapus jurnal & file terkait (DELETE /api/v1/journals/:id)
 * Perbaikan: Menghapus Video DAN Semua Foto Inline di GCS
 */
const deleteJournal = async (user, journalId) => {
    const docRef = database.collection("journals").doc(journalId);
    const doc = await docRef.get();

    if (!doc.exists) throw new ResponseError(404, "Jurnal tidak ditemukan");

    const journalData = doc.data();
    if (journalData.user_id !== user.uid) throw new ResponseError(403, "Akses ditolak");

    const deletePromises = [];
    
    if (journalData.video_url) {
        deletePromises.push(deleteService.removeFile(user, journalData.video_url));
    }
    
    if (journalData.note) {
        const imageUrls = extractImageUrls(journalData.note);
        if (imageUrls.length > 0) {
            imageUrls.forEach(url => {
                deletePromises.push(deleteService.removeFile(user, url)); 
            });
        }
    }

    await Promise.allSettled(deletePromises);
    await docRef.delete();

    return { message: "Jurnal dan seluruh file terkait berhasil dihapus" };
};

/**
 * Meminta AI untuk memperbaiki / mengembangkan teks jurnal (POST /api/v1/journals/enhance)
 * Hanya meneruskan request ke ai-helper-service.
 * @param {Object} user - User object (tidak digunakan, tapi konsisten dengan service lain)
 * @param {Object} request - Body request { text, instruction }
 * @returns {Object} Hasil teks yang sudah diperbaiki oleh AI
 */
const enhanceJournalText = async (user, request) => {
    return await aiHelperService.enhanceJournalText(request);
};

/**
 * Melakukan tanya jawab interaktif dengan konteks jurnal tertentu (POST /api/v1/journals/:id/chat)
 * @param {Object} user - User object yang sedang login (req.user)
 * @param {String} journalId - UUID Jurnal yang akan dijadikan konteks
 * @param {Object} request - Body request berisi { message: "..." }
 * @returns {Promise<Object>} Object berisi { journal_id, question, reply }
 * @throws {ResponseError} 404 jika jurnal tidak ditemukan atau bukan milik user
 */
const chat = async (user, journalId, request) => {
    const docRef = database.collection("journals").doc(journalId);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new ResponseError(404, "Jurnal tidak ditemukan.");
    }

    const journalData = doc.data();

    if (journalData.user_id !== user.uid) {
        throw new ResponseError(404, "Jurnal tidak ditemukan.");
    }

    const aiReply = await aiHelperService.chatWithJournalContext(journalData, request.message);

    return {
        journal_id: journalId,
        question: request.message,
        reply: aiReply
    };
};

/**
 * Memicu analisis AI manual untuk jurnal tertentu (POST /api/v1/journals/:id/analyze)
 * Mengambil data jurnal, meminta insight ke AI (Tags, Strategy, Suggestion), 
 * dan menyimpan hasilnya secara permanen ke database.
 * * @param {Object} user - User object yang sedang login (mengandung uid)
 * @param {String} journalId - UUID Jurnal yang akan dianalisis
 * @returns {Promise<Object>} Data jurnal lengkap yang sudah diupdate dengan insight AI
 * @throws {ResponseError} 404 jika jurnal tidak ditemukan atau bukan milik user
 * @throws {ResponseError} 500 jika layanan AI gagal
 */
const analyze = async (user, journalId) => {
    const docRef = database.collection("journals").doc(journalId);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new ResponseError(404, "Jurnal tidak ditemukan.");
    }

    const journalData = doc.data();

    if (journalData.user_id !== user.uid) {
        throw new ResponseError(404, "Jurnal tidak ditemukan.");
    }

    const insights = await aiHelperService.generateJournalInsights(journalData);

    if (!insights) {
        throw new ResponseError(500, "Layanan AI sedang sibuk, gagal mendapatkan insight.");
    }

    const updateData = {
        tags: insights.tags,
        chatbot_highlight: insights.chatbot_highlight,
        chatbot_suggestion: insights.chatbot_suggestion,
        chatbot_strategy: insights.chatbot_strategy,
        updated_at: new Date().toISOString()
    };

    await docRef.update(updateData);

    return {
        ...journalData,
        ...updateData
    };
};

/**
 * Mengambil data Mood Calendar (GET /api/v1/mood-calendar)
 * Mengelompokkan emosi berdasarkan tanggal dalam bulan tertentu.
 * @param {Object} user - User object
 * @param {Object} request - Query { year, month }
 */
const getMoodCalendar = async (user, request) => {
    const now = new Date();
    const year = request.year ? parseInt(request.year) : now.getFullYear();
    const month = request.month ? parseInt(request.month) : now.getMonth() + 1;
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const journalsRef = database.collection("journals");
    
    const snapshot = await journalsRef
        .where("user_id", "==", user.uid)
        .where("created_at", ">=", startDate.toISOString())
        .where("created_at", "<=", endDate.toISOString())
        .orderBy("created_at", "desc") 
        .get();

    const moods = {};

    if (!snapshot.empty) {
        snapshot.forEach(doc => {
            const data = doc.data();
            
            const dateObj = new Date(data.created_at);
            const day = dateObj.getUTCDate();

            if (!moods[day]) {
                moods[day] = {
                    emotion: data.emotion,
                    expression: data.expression 
                };
            }
        });
    }

    return {
        year: year,
        month: month,
        moods: moods
    };
};

export default {
    createJournal,
    listJournal,
    getDetailJournal,
    updateJournal,
    deleteJournal,
    chat,
    analyze,
    getMoodCalendar,
    enhanceJournalText
};