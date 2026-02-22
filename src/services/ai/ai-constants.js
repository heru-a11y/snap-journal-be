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
    TEXT_ENHANCEMENT: {
        [AI_INSTRUCTIONS.FIX_GRAMMAR]: "Perbaiki tata bahasa dan ejaan teks berikut agar menjadi Bahasa Indonesia baku. Jangan ubah makna. Hanya berikan hasil perbaikan tanpa kutipan.",
        [AI_INSTRUCTIONS.PARAPHRASE]: "Tulis ulang teks berikut agar lebih natural dalam Bahasa Indonesia. Makna tetap sama. Hanya berikan hasil teks baru.",
        [AI_INSTRUCTIONS.ELABORATION]: "Kembangkan teks jurnal ini menjadi lebih deskriptif dan reflektif. Gunakan gaya bahasa diary yang mendalam. Hanya berikan hasil teks.",
        [AI_INSTRUCTIONS.GENERAL]: "Rapikan teks berikut ini. Hanya berikan hasilnya."
    },
    VISION_ANALYSIS: `Tugas: Analisis ekspresi wajah secara VISUAL dari video ini.
        Instruksi:
        1. "emotion": Pilih satu: ["Happy", "Calm", "Sad", "Tired", "Angry"].
        2. "expression": WAJIB hanya 1 karakter emoji yang paling mewakili raut wajah (misal: 😊, 😐, 😢, 😴, 😡). JANGAN berikan teks deskripsi.
        3. "confidence": Skor keyakinan visual (0.0 - 1.0).
        Output WAJIB JSON valid tanpa markdown:
        {"emotion": "string", "expression": "string", "confidence": number}`,
    
    CHAT_CONTEXT: (data, msg) => `Peran: Kamu adalah asisten AI reflektif dan psikolog pribadi profesional.
        DATA JURNAL: Judul: "${data.title}", Isi: "${data.note}", Emosi: ${data.emotion || 'Tidak ada'}.
        PERTANYAAN: "${msg}"
        Instruksi: Jawab dengan Bahasa Indonesia natural namun tetap profesional. Jangan gunakan emoji. Fokus pada empati logis dan saran praktis.`,

    INSIGHT_GENERATION: (text, context) => `Analisis jurnal berikut sebagai psikolog klinis.
        Data: ${text} ${context}
        Instruksi: Jangan gunakan emoji dalam teks jawaban.
        Output WAJIB JSON: {"tags": [], "chatbot_highlight": "", "chatbot_suggestion": "", "chatbot_strategy": ""}`,

    PERIODIC_INSIGHT: (dataString) => `Tugas: Analisis riwayat jurnal pengguna.
        Data: ${dataString}
        Instruksi: "expression" diisi dengan deskripsi kata (bukan emoji).
        Output JSON: {"expression": "string", "highlight": "string"}`
};

export const FALLBACKS = {
    VISION: { emotion: "Calm", expression: "😐", confidence: 0.5 },
    INSIGHT: {
        tags: ["Refleksi"],
        chatbot_highlight: "Insight jurnal harian.",
        chatbot_suggestion: "Terima kasih sudah menulis hari ini.",
        chatbot_strategy: "Luangkan waktu sejenak untuk istirahat."
    },
    PERIODIC: {
        expression: "Stabil",
        highlight: "Pantau terus perkembangan emosimu."
    },
    REMINDER: (name) => ({
        title: "Waktunya Menulis Jurnal",
        body: `Halo ${name}, bagikan ceritamu hari ini di Snap Journal.`
    })
};