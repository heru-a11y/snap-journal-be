import { model } from "../applications/gemini.js";
import { ResponseError } from "../error/response-error.js";
import { aiFormat } from "../utils/textFormatter.js"; 

/**
 * Meminta AI memperbaiki/mengembangkan teks jurnal
 * @param {Object} request - Body { text, instruction }
 */
const enhanceJournalText = async (request) => {
    const { text, instruction } = request;

    if (!model) {
        throw new ResponseError(500, "Layanan AI tidak terkonfigurasi (API Key missing).");
    }

    if (!text) {
        throw new ResponseError(400, "Field 'text' wajib diisi.");
    }

    let systemInstruction = "";
    
    switch (instruction) {
        case "fix_grammar":
            systemInstruction = "Perbaiki tata bahasa (grammar) dan ejaan (typo) teks berikut agar menjadi Bahasa Indonesia yang baku dan benar. Jangan ubah makna kalimat. Hanya berikan hasil perbaikan.";
            break;
        case "paraphrase":
            systemInstruction = "Tulis ulang (parafrase) teks berikut agar lebih mengalir dan natural, namun maknanya tetap sama. Hanya berikan hasil teks baru.";
            break;
        case "elaboration":
            systemInstruction = "Kembangkan teks jurnal pendek ini menjadi lebih panjang, deskriptif, dan menyentuh perasaan. Bayangkan Anda adalah penulis yang sedang mencurahkan isi hati di diary. Hanya berikan hasil teks.";
            break;
        default:
            systemInstruction = "Rapikan teks berikut ini. Hanya berikan hasilnya.";
            break;
    }

    const prompt = `${systemInstruction}\n\n---\nTeks Asli: "${text}"\n---`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        let aiOutput = response.text();
        
        aiOutput = aiFormat(aiOutput); 

        return {
            original_text: text,
            enhanced_text: aiOutput,
            instruction: instruction || "general"
        };

    } catch (error) {
        console.error("Gemini Error:", error);
        throw new ResponseError(500, "Gagal memproses permintaan AI. Silakan coba lagi.");
    }
};

/**
 * Menganalisis VISUAL (Video) untuk deteksi ekspresi wajah (Face Recognition)
 * Fungsi ini tidak membaca teks, hanya fokus pada aspek visual.
 * @param {Object} filePart - Objek file format Gemini { inlineData: { data, mimeType } }
 */
const analyzeVideo = async (filePart) => {
    if (!model || !filePart) return null; 

    const prompt = `
        Tugas: Analisis ekspresi wajah dan aura emosi secara VISUAL dari media ini.
        Instruksi:
        1. "emotion": Pilih SATU dari kategori: ["Happy", "Calm", "Sad", "Tired", "Angry"].
        2. "expression": Satu emoji yang paling mewakili raut wajah (misal: 😊, 😢, 😴, 😡, 🧘).
        3. "confidence": Skor keyakinan visual (0.0 - 1.0).

        Output WAJIB JSON valid tanpa markdown:
        {"emotion": "string", "expression": "string", "confidence": number}
    `;

    try {
        const result = await model.generateContent([prompt, filePart]);
        const response = await result.response;
        let jsonText = response.text().replace(/```json|```/g, "").trim();

        const analysis = JSON.parse(jsonText);

        const validEmotions = ["Happy", "Calm", "Sad", "Tired", "Angry"];
        let finalEmotion = (analysis.emotion || "Calm").charAt(0).toUpperCase() + (analysis.emotion || "Calm").slice(1).toLowerCase();

        if (!validEmotions.includes(finalEmotion)) finalEmotion = "Calm";

        return {
            emotion: finalEmotion,
            expression: analysis.expression || "😐",
            confidence: analysis.confidence || 0.5
        };
    } catch (error) {
        console.error("Gemini Visual Analysis Error:", error.message);
        return { emotion: "Calm", expression: "😐", confidence: 0.5 }; 
    }
};

/**
 * Chat Interaktif dengan Konteks Jurnal
 * @param {Object} journalData - Data lengkap jurnal (title, note, emotion, dll)
 * @param {String} userMessage - Pertanyaan dari user
 */
const chatWithJournalContext = async (journalData, userMessage) => {
    if (!model) {
        throw new ResponseError(500, "Layanan AI sedang tidak tersedia.");
    }

    if (!userMessage) {
        throw new ResponseError(400, "Pesan pertanyaan wajib diisi.");
    }

    const prompt = `
        Peran: Kamu adalah asisten AI empatik dan psikolog pribadi yang mengerti perasaan user.
        Tugas: Jawab pertanyaan user berdasarkan DATA JURNAL di bawah ini.
        
        DATA JURNAL USER:
        - Judul: "${journalData.title}"
        - Isi Catatan: "${journalData.note}"
        - Emosi Terdeteksi Sebelumnya: ${journalData.emotion || "Tidak ada"}
        - Ekspresi Wajah (Emoji): ${journalData.expression || "-"}
        - Saran AI Sebelumnya: ${journalData.chatbot_suggestion || "-"}
        
        PERTANYAAN USER:
        "${userMessage}"

        Instruksi Jawaban:
        1. Jawablah dengan bahasa Indonesia yang natural, hangat, dan suportif.
        2. Gunakan "kamu" untuk menyapa user.
        3. Jelaskan alasan logis jika user bertanya "Kenapa" (hubungkan dengan kata-kata di catatan atau emosi).
        4. Jangan berhalusinasi (mengarang fakta di luar jurnal), tapi boleh memberikan saran psikologis umum yang relevan.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        let aiReply = response.text();
        aiReply = aiFormat(aiReply);

        return aiReply;

    } catch (error) {
        console.error("Gemini Chat Error:", error);
        throw new ResponseError(500, "Gagal memproses percakapan dengan AI.");
    }
};

/**
 * Melakukan Deep Analysis pada TEKS Jurnal (Title & Note)
 * untuk mengisi field Insight (Tags, Highlight, Suggestion, Strategy)
 * * @param {Object} journalData - Data jurnal lengkap (termasuk title, note, dan emotion dari video jika ada)
 * @returns {Object|null} JSON berisi tags, highlight, strategy, suggestion atau null jika gagal
 */
const generateJournalInsights = async (journalData) => {
    if (!model || !journalData) return null;

    const journalText = `Judul: "${journalData.title}"\nIsi Catatan: "${journalData.note || '-'}"`;
    const visualContext = journalData.emotion 
        ? `(Konteks Tambahan: Wajah user terdeteksi emosi "${journalData.emotion}")` 
        : "";

    const prompt = `
        Bertindaklah sebagai psikolog klinis dan life coach yang empatik.
        Lakukan analisis mendalam terhadap TEKS jurnal berikut.

        Data Jurnal:
        ${journalText}
        ${visualContext}

        Instruksi Analisis:
        1. Identifikasi topik utama dan perasaan tersirat dari kata-kata user.
        2. Jika teks sangat singkat, kembangkan saran berdasarkan Judul dan Emosi Visual.
        3. Gunakan Bahasa Indonesia yang natural, hangat, dan tidak kaku (seperti teman curhat yang bijak).

        Output WAJIB JSON Valid (tanpa markdown):
        {
            "tags": ["String", "String", "String"], // Maksimal 3 kata kunci relevan (misal: "Burnout", "Keluarga", "Syukur")
            "chatbot_highlight": "String", // Satu kalimat ringkasan inti masalah/cerita (maks 20 kata)
            "chatbot_suggestion": "String", // Saran reflektif yang menenangkan & validasi perasaan (2-3 kalimat)
            "chatbot_strategy": "String" // Satu tindakan nyata (actionable step) yang spesifik dan mudah dilakukan
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonText = response.text();

        jsonText = jsonText.replace(/```json|```/g, "").trim();
        
        const analysis = JSON.parse(jsonText);

        return {
            tags: Array.isArray(analysis.tags) ? analysis.tags.slice(0, 3) : ["Refleksi"],
            chatbot_highlight: analysis.chatbot_highlight || "Insight jurnal harianmu.",
            chatbot_suggestion: analysis.chatbot_suggestion || "Terima kasih sudah berbagi cerita hari ini.",
            chatbot_strategy: analysis.chatbot_strategy || "Istirahatlah sejenak untuk menenangkan pikiran."
        };

    } catch (error) {
        console.error("Gemini Text Analysis Error:", error.message);
        return null;
    }
};

/**
 * Membuat pesan reminder personal (Title & Body) berdasarkan konteks jurnal terakhir
 */
const generatePersonalizedReminder = async (lastJournal, userName) => {
    if (!model) return null;

    const prompt = `
        Tugas: Buatlah notifikasi push pengingat menulis jurnal untuk user bernama ${userName}.
        
        Konteks Jurnal Terakhir User:
        - Judul: "${lastJournal.title}"
        - Isi: "${lastJournal.note}"
        - Emosi: "${lastJournal.emotion || 'Netral'}"
        
        Instruksi:
        1. Gunakan nada bicara yang empati, hangat, dan suportif.
        2. Hubungkan dengan topik jurnal terakhirnya secara kreatif.
        3. Output WAJIB berupa JSON valid tanpa markdown.
        
        Format JSON:
        {
          "title": "Judul singkat (3-5 kata) yang menarik perhatian",
          "body": "Satu kalimat hangat (maks 20 kata) yang berkaitan dengan jurnal sebelumnya"
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonText = response.text().replace(/```json|```/g, "").trim();
        
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("AI Personalized Reminder Error:", error);
        return {
            title: "Waktunya Menulis Jurnal ✍️",
            body: `Halo ${userName}, bagaimana harimu? Ceritakan di Snap Journal yuk!`
        };
    }
};

export default {
    enhanceJournalText,
    analyzeVideo,
    chatWithJournalContext,
    generateJournalInsights,
    generatePersonalizedReminder
};