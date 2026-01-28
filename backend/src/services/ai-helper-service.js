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
 * Menganalisis teks untuk mendapatkan Emosi & Ekspresi (Emoji)
 * @param {String} text - Teks jurnal (Title + Note)
 */
const analyzeSentiment = async (text) => {
    if (!model) return null; 
    if (!text || text.length < 3) return null; 

    const prompt = `
        Analisis teks jurnal berikut sebagai seorang psikolog empati. Tentukan:
        1. "emotion": Satu kata sifat bahasa Inggris yang paling mewakili perasaan dominan penulis (contoh: Happy, Sad, Anxious, Grateful, Tired, Excited, Angry, Calm).
        2. "expression": Satu emoji yang paling tepat mewakili nuansa teks (contoh: 😊, 😢, 😴, 😡, 🧘).
        3. "confidence": Angka desimal 0.0 - 1.0 seberapa yakin kamu dengan analisis ini.

        Output WAJIB berupa JSON valid saja tanpa format markdown.
        Format JSON: {"emotion": "string", "expression": "string", "confidence": number}
        
        Teks Jurnal: "${text}"
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonText = response.text();

        jsonText = jsonText.replace(/```json|```/g, "").trim();

        const analysis = JSON.parse(jsonText);

        return {
            emotion: analysis.emotion || "Neutral",
            expression: analysis.expression || "😐",
            confidence: analysis.confidence || 0.5
        };

    } catch (error) {
        console.error("Gemini Sentiment Error:", error.message);
        return null; 
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
 * Melakukan Deep Analysis untuk mengisi field Insight (Strategy, Highlight, Suggestion, Tags)
 * @param {Object} journalData - Data jurnal (title, note)
 * @returns {Object} JSON berisi tags, highlight, strategy, suggestion
 */
const generateJournalInsights = async (journalData) => {
    if (!model) return null;

    const prompt = `
        Bertindaklah sebagai psikolog dan life coach profesional. 
        Analisis jurnal berikut dan berikan insight mendalam dalam format JSON.
        
        Data Jurnal:
        - Judul: "${journalData.title}"
        - Isi: "${journalData.note}"
        - Emosi Awal: "${journalData.emotion || 'Netral'}"

        Tugasmu adalah mengisi 4 hal ini:
        1. "tags": Array of strings (maksimal 3 kata kunci relevan, misal: ["Karir", "Kecemasan", "Produktivitas"]).
        2. "chatbot_highlight": Satu kalimat pendek yang merangkum inti masalah/cerita (Ringkasan).
        3. "chatbot_suggestion": Saran reflektif yang hangat dan menenangkan hati user (sekitar 2-3 kalimat).
        4. "chatbot_strategy": Satu langkah aksi nyata (actionable step) yang bisa dilakukan user besok.

        Output WAJIB JSON Valid tanpa markdown.
        Contoh Format:
        {
            "tags": ["Stress", "Work"],
            "chatbot_highlight": "Kamu merasa tertekan karena deadline pekerjaan yang menumpuk.",
            "chatbot_suggestion": "Tidak apa-apa untuk merasa lelah. Cobalah untuk tidak memaksakan kesempurnaan.",
            "chatbot_strategy": "Buatlah daftar prioritas dan kerjakan satu per satu mulai besok pagi."
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonText = response.text();

        jsonText = jsonText.replace(/```json|```/g, "").trim();
        
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Gemini Insight Error:", error);
        throw new ResponseError(500, "Gagal menghasilkan insight AI.");
    }
};

export default {
    enhanceJournalText,
    analyzeSentiment,
    chatWithJournalContext,
    generateJournalInsights
};