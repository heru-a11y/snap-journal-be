import { database } from "../applications/database.js";
import { ResponseError } from "../error/response-error.js";
import { v4 as uuidv4 } from "uuid";
import aiHelperService from "./ai-helper-service.js";
import uploadService from "./upload-service.js";
import deleteService from "./delete-service.js";

const createJournal = async (user, request, videoFile) => {
    if (!request.title) throw new ResponseError(400, "Judul jurnal wajib diisi.");
    if (!videoFile) throw new ResponseError(400, "File video wajib diupload.");

    const journalId = uuidv4();
    const now = new Date().toISOString();
    
    const videoUrl = await uploadService.uploadJournalVideo(user, videoFile);
    
    const finalNote = request.note || "";

    let aiAnalysis = { emotion: null, expression: null, confidence: null };
    try {
        if (videoFile && videoFile.buffer) {
            const videoPart = {
                inlineData: {
                    data: videoFile.buffer.toString("base64"),
                    mimeType: videoFile.mimetype
                }
            };
            const result = await aiHelperService.analyzeVideo(videoPart);
            if (result) aiAnalysis = result;
        }
    } catch (e) {
        console.error("AI Video Analysis Skipped:", e.message);
    }

    const journalData = {
        id: journalId,
        user_id: user.uid,
        title: request.title,
        note: finalNote,
        video_url: videoUrl,
        is_favorite: false,
        is_draft: false,
        emotion: aiAnalysis.emotion,        
        expression: aiAnalysis.expression,  
        confidence: aiAnalysis.confidence,  
        chatbot_suggestion: null, chatbot_highlight: null, chatbot_strategy: null, tags: null,
        created_at: now,
        updated_at: now
    };

    await database.collection("journals").doc(journalId).set(journalData);
    await database.collection("users").doc(user.uid).update({ last_entry: now });

    return journalData;
};

const createJournalDraft = async (user, request, videoFile) => {
    const journalId = uuidv4();
    const now = new Date().toISOString();
    
    let videoUrl = null;
    if (videoFile) videoUrl = await uploadService.uploadJournalVideo(user, videoFile);
    
    const finalNote = request.note || "";
    
    const journalData = {
        id: journalId,
        user_id: user.uid,
        title: request.title || "Untitled Draft",
        note: finalNote,
        video_url: videoUrl,
        is_favorite: false,
        is_draft: true,
        emotion: null, expression: null, confidence: null,
        chatbot_suggestion: null, chatbot_highlight: null, chatbot_strategy: null, tags: null,
        created_at: now,
        updated_at: now
    };

    await database.collection("journals").doc(journalId).set(journalData);
    return journalData;
};

const updateJournal = async (user, request, journalId, videoFile) => {
    const docRef = database.collection("journals").doc(journalId);
    const doc = await docRef.get();

    if (!doc.exists) throw new ResponseError(404, "Jurnal tidak ditemukan");

    const currentData = doc.data();
    if (currentData.user_id !== user.uid) throw new ResponseError(403, "Akses ditolak");

    const now = new Date().toISOString();
    const updates = { updated_at: now };

    if (request.title !== undefined && request.title.trim() !== "") {
        updates.title = request.title;
    }
    
    if (request.note !== undefined) {
        updates.note = request.note;
    }
    
    if (videoFile) {
        if (currentData.video_url) await deleteService.removeFile(user, currentData.video_url); 
        updates.video_url = await uploadService.uploadJournalVideo(user, videoFile);

        try {
            if (videoFile.buffer) {
                const videoPart = {
                    inlineData: {
                        data: videoFile.buffer.toString("base64"),
                        mimeType: videoFile.mimetype
                    }
                };
                const visualResult = await aiHelperService.analyzeVideo(videoPart);
                if (visualResult) {
                    updates.emotion = visualResult.emotion;
                    updates.expression = visualResult.expression;
                    updates.confidence = visualResult.confidence;
                }
            }
        } catch (e) {
            console.error("Gagal melakukan Re-analisis Visual pada Update:", e.message);
        }
    }

    const isTitleChanged = request.title && request.title !== currentData.title;
    const isNoteChanged = request.note && request.note !== currentData.note;
    const isVideoChanged = !!videoFile;

    if (isTitleChanged || isNoteChanged || isVideoChanged) {
        updates.tags = null;
        updates.chatbot_highlight = null;
        updates.chatbot_suggestion = null;
        updates.chatbot_strategy = null;
    }

    await docRef.update(updates);
    return { ...currentData, ...updates };
};

const listJournal = async (user, request) => {
    let startDate, endDate;
    let filterType;

    if (request.start_date && request.end_date) {
        filterType = "range";
        startDate = new Date(request.start_date);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(request.end_date);
        endDate.setHours(23, 59, 59, 999);
    } else if (request.date) {
        filterType = "date";
        startDate = new Date(request.date);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(request.date);
        endDate.setHours(23, 59, 59, 999);
    } else {
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

    let journals = [];
    if (!snapshot.empty) {
        snapshot.forEach(doc => {
            journals.push(doc.data());
        });
    }

    if (request.category) {
        const cat = request.category.toLowerCase();
        
        if (cat === 'draft') {
            journals = journals.filter(j => j.is_draft === true);
        } else if (cat === 'favorites') {
            journals = journals.filter(j => j.is_favorite === true && j.is_draft !== true);
        } else {
            journals = journals.filter(j => j.is_draft !== true);
        }
    } else {
        journals = journals.filter(j => j.is_draft !== true);
    }

    return {
        meta: {
            filter_type: filterType,
            filter_category: request.category || "all",
            total_data: journals.length
        },
        data: journals
    };
};

const toggleFavorite = async (user, journalId, request) => {
    const docRef = database.collection("journals").doc(journalId);
    const doc = await docRef.get();

    if (!doc.exists) throw new ResponseError(404, "Jurnal tidak ditemukan");
    
    const currentData = doc.data();
    if (currentData.user_id !== user.uid) throw new ResponseError(403, "Akses ditolak");

    const isFavorite = request.is_favorite === true || request.is_favorite === "true";

    await docRef.update({
        is_favorite: isFavorite,
        updated_at: new Date().toISOString()
    });

    return {
        id: journalId,
        is_favorite: isFavorite
    };
};

const toggleDraft = async (user, journalId, request) => {
    const docRef = database.collection("journals").doc(journalId);
    const doc = await docRef.get();

    if (!doc.exists) throw new ResponseError(404, "Jurnal tidak ditemukan");
    
    const currentData = doc.data();
    if (currentData.user_id !== user.uid) throw new ResponseError(403, "Akses ditolak");

    const isDraft = request.is_draft === true || request.is_draft === "true";
    const now = new Date().toISOString();

    if (isDraft === false) {
        if (!currentData.title || currentData.title.trim() === "" || currentData.title === "Untitled Draft") {
            throw new ResponseError(400, "Judul harus diisi dengan benar sebelum dipublikasikan.");
        }
        if (!currentData.video_url) {
            throw new ResponseError(400, "Jurnal harus memiliki video sebelum dipublikasikan.");
        }
    }

    const updates = {
        is_draft: isDraft,
        updated_at: now
    };

    if (currentData.is_draft === true && isDraft === false) {
        await database.collection("users").doc(user.uid).update({ last_entry: now });
    }

    await docRef.update(updates);

    return {
        id: journalId,
        is_draft: isDraft,
        message: isDraft ? "Jurnal disimpan ke draft" : "Jurnal berhasil dipublikasikan"
    };
};

const getDetailJournal = async (user, journalId) => {
    const docRef = database.collection("journals").doc(journalId);
    const doc = await docRef.get();

    if (!doc.exists) throw new ResponseError(404, "Jurnal tidak ditemukan");
    
    const journalData = doc.data();
    if (journalData.user_id !== user.uid) throw new ResponseError(403, "Akses ditolak");
    
    return journalData;
};

const getLatestJournal = async (user) => {
    const journalsRef = database.collection("journals");
    const snapshot = await journalsRef
        .where("user_id", "==", user.uid)
        .where("is_draft", "==", false)
        .orderBy("created_at", "desc")
        .limit(1)
        .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
};

const getDailyInsight = async (user) => {
    const journalsRef = database.collection("journals");
    const snapshot = await journalsRef
        .where("user_id", "==", user.uid)
        .where("is_draft", "==", false)
        .orderBy("created_at", "desc")
        .limit(1)
        .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    let journalData = doc.data();

    if (!journalData.chatbot_highlight) {
        try {
            const insights = await aiHelperService.generateJournalInsights(journalData);
            if (insights) {
                await doc.ref.update({
                    chatbot_highlight: insights.chatbot_highlight,
                    chatbot_strategy: insights.chatbot_strategy,
                    chatbot_suggestion: insights.chatbot_suggestion,
                    updated_at: new Date().toISOString()
                });
                journalData.chatbot_highlight = insights.chatbot_highlight;
            }
        } catch (e) {
            console.error("Gagal generate insight otomatis:", e.message);
        }
    }

    return {
        journal_id: journalData.id,
        date: journalData.created_at,
        expression: journalData.expression || "😐",
        highlight: journalData.chatbot_highlight || "Belum ada insight."
    };
};

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
        const imgRegex = /<img[^>]+src="([^">]+)"/g;
        let match;

        while ((match = imgRegex.exec(journalData.note)) !== null) {
            const imageUrl = match[1];
            
            if (imageUrl.includes(`journals/${user.uid}/`)) {
                console.log("Menghapus gambar embedded:", imageUrl);
                deletePromises.push(deleteService.removeFile(user, imageUrl));
            }
        }
    }

    await Promise.allSettled(deletePromises);
    await docRef.delete();

    return { message: "Jurnal dan seluruh file media berhasil dihapus" };
};

const analyze = async (user, journalId) => {
    const docRef = database.collection("journals").doc(journalId);
    const doc = await docRef.get();
    if (!doc.exists) throw new ResponseError(404, "Jurnal tidak ditemukan.");
    
    const journalData = doc.data();
    if (journalData.user_id !== user.uid) throw new ResponseError(404, "Akses Ditolak");

    const insights = await aiHelperService.generateJournalInsights(journalData);
    if (!insights) throw new ResponseError(500, "AI Busy");

    const updateData = {
        tags: insights.tags,
        chatbot_highlight: insights.chatbot_highlight,
        chatbot_suggestion: insights.chatbot_suggestion,
        chatbot_strategy: insights.chatbot_strategy,
        updated_at: new Date().toISOString()
    };
    await docRef.update(updateData);
    return { ...journalData, ...updateData };
};

const enhanceJournalText = async (user, request) => {
    return await aiHelperService.enhanceJournalText(request);
};

const chat = async (user, journalId, request) => {
    const docRef = database.collection("journals").doc(journalId);
    const doc = await docRef.get();
    if (!doc.exists) throw new ResponseError(404, "Jurnal tidak ditemukan.");
    
    const journalData = doc.data();
    if (journalData.user_id !== user.uid) throw new ResponseError(404, "Akses Ditolak");
    
    const aiReply = await aiHelperService.chatWithJournalContext(journalData, request.message);
    return { journal_id: journalId, question: request.message, reply: aiReply };
};

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
            if (!data.is_draft) {
                const dateObj = new Date(data.created_at);
                const day = dateObj.getUTCDate();
                if (!moods[day]) {
                    moods[day] = { emotion: data.emotion, expression: data.expression };
                }
            }
        });
    }
    return { year, month, moods };
};

export default {
    createJournal,
    createJournalDraft,
    listJournal,
    getDetailJournal,
    getLatestJournal,
    getDailyInsight,
    updateJournal,
    toggleFavorite,
    toggleDraft, 
    deleteJournal,
    chat,
    analyze,
    getMoodCalendar,
    enhanceJournalText
};