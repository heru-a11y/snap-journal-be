export const AI_INSTRUCTIONS = {
    FIX_GRAMMAR: "fix_grammar",
    PARAPHRASE: "paraphrase",
    ELABORATION: "elaboration",
    GENERAL: "general"
};

export const EMOTIONS = {
    HAPPY: "Happy",
    CALM: "Calm",
    SAD: "Sad",
    TIRED: "Tired",
    ANGRY: "Angry",
    NEUTRAL: "Neutral"
};

export const AI_PROMPTS = {
    TEXT_ENHANCEMENT: (instruction, lang) => {
        const prompts = {
            id: {
                [AI_INSTRUCTIONS.FIX_GRAMMAR]: "Perbaiki tata bahasa dan ejaan teks berikut menggunakan bahasa aslinya. Jangan ubah makna. Hanya berikan hasil perbaikan tanpa kutipan.",
                [AI_INSTRUCTIONS.PARAPHRASE]: "Tulis ulang teks berikut agar lebih natural menggunakan bahasa aslinya. Makna tetap sama. Hanya berikan hasil teks baru.",
                [AI_INSTRUCTIONS.ELABORATION]: "Kembangkan teks jurnal ini menjadi lebih deskriptif dan reflektif menggunakan bahasa aslinya. Gunakan gaya bahasa diary yang mendalam. Hanya berikan hasil teks.",
                [AI_INSTRUCTIONS.GENERAL]: "Rapikan teks berikut ini dengan mempertahankan bahasa aslinya. Hanya berikan hasilnya."
            },
            en: {
                [AI_INSTRUCTIONS.FIX_GRAMMAR]: "Fix the grammar and spelling of the following text in its original language. Do not change the meaning. Only provide the corrected result without quotes.",
                [AI_INSTRUCTIONS.PARAPHRASE]: "Rewrite the following text to sound more natural in its original language. Keep the meaning the same. Only provide the new text.",
                [AI_INSTRUCTIONS.ELABORATION]: "Elaborate on this journal text to make it more descriptive and reflective in its original language. Use a deep diary writing style. Only provide the text result.",
                [AI_INSTRUCTIONS.GENERAL]: "Tidy up the following text in its original language. Only provide the result."
            }
        };
        return prompts[lang][instruction] || prompts[lang][AI_INSTRUCTIONS.GENERAL];
    },
    
    VISION_ANALYSIS: `Tugas: Analisis ekspresi wajah secara VISUAL dari video ini.
        Instruksi:
        1. "emotion": Pilih satu: ["Happy", "Calm", "Sad", "Tired", "Angry"].
        2. "expression": WAJIB hanya 1 karakter emoji yang paling mewakili raut wajah (misal: 😊, 😐, 😢, 😴, 😡). JANGAN berikan teks deskripsi.
        3. "confidence": Skor keyakinan visual (0.0 - 1.0).
        Output WAJIB JSON valid tanpa markdown:
        {"emotion": "string", "expression": "string", "confidence": number}`,
    
    CHAT_CONTEXT: (data, msg, lang) => {
        const langTarget = lang === 'en' ? 'English' : 'Bahasa Indonesia';
        return `Peran: Kamu adalah asisten AI reflektif dan psikolog pribadi profesional.
        DATA JURNAL: Judul: "${data.title}", Isi: "${data.note}", Emosi: ${data.emotion || 'Tidak ada'}.
        PERTANYAAN: "${msg}"
        Instruksi: Jawab dengan ${langTarget} natural namun tetap profesional. Jangan gunakan emoji. Fokus pada empati logis dan saran praktis.`;
    },

    INSIGHT_GENERATION: (text, context, lang) => {
        const langTarget = lang === 'en' ? 'English' : 'Bahasa Indonesia';
        return `Analisis jurnal berikut sebagai psikolog klinis.
        Data: ${text} ${context}
        Instruksi: Jangan gunakan emoji dalam teks jawaban. Pastikan seluruh value JSON ditulis menggunakan ${langTarget}.
        Output WAJIB JSON: {"tags": [], "chatbot_highlight": "", "chatbot_suggestion": "", "chatbot_strategy": ""}`;
    },

    PERIODIC_INSIGHT: (dataString, lang) => {
        const langTarget = lang === 'en' ? 'English' : 'Bahasa Indonesia';
        return `Tugas: Analisis riwayat jurnal pengguna.
        Data: ${dataString}
        Instruksi: "expression" diisi dengan deskripsi kata (bukan emoji) dalam ${langTarget}. "highlight" ditulis dalam ${langTarget}.
        Output JSON: {"expression": "string", "highlight": "string"}`;
    },

    REMINDER: (lastJournal, userName, lang) => {
        const langTarget = lang === 'en' ? 'English' : 'Bahasa Indonesia';
        return `Tugas: Buat notifikasi push pengingat jurnal untuk ${userName}. Konteks: ${lastJournal.title}. Output harus dalam ${langTarget}. Output JSON {"title": "", "body": ""}`;
    }
};

export const FALLBACKS = {
    VISION: { emotion: "Calm", expression: "😐", confidence: 0.5 },
    INSIGHT: {
        id: {
            tags: ["Refleksi"],
            chatbot_highlight: "Insight jurnal harian.",
            chatbot_suggestion: "Terima kasih sudah menulis hari ini.",
            chatbot_strategy: "Luangkan waktu sejenak untuk istirahat."
        },
        en: {
            tags: ["Reflection"],
            chatbot_highlight: "Daily journal insight.",
            chatbot_suggestion: "Thank you for writing today.",
            chatbot_strategy: "Take a moment to rest."
        }
    },
    PERIODIC: {
        id: {
            expression: "Stabil",
            highlight: "Pantau terus perkembangan emosimu."
        },
        en: {
            expression: "Stable",
            highlight: "Keep monitoring your emotional progress."
        }
    },
    REMINDER: (name) => ({
        id: {
            title: "Waktunya Menulis Jurnal",
            body: `Halo ${name}, bagikan ceritamu hari ini di Snap Journal.`
        },
        en: {
            title: "Time to Journal",
            body: `Hello ${name}, share your story today on Snap Journal.`
        }
    })
};