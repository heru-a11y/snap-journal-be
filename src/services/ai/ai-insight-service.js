import aiClient from "./ai-client.js";
import { AI_PROMPTS, FALLBACKS } from "../../constants/ai-constants.js";
import { logger } from "../../applications/logging.js";

const generateJournalInsights = async (journalData, lang = 'id') => {
    if (!journalData) return FALLBACKS.INSIGHT[lang];

    const journalText = `Judul: "${journalData.title}"\nIsi: "${journalData.note || '-'}"`;
    const visualContext = journalData.emotion ? `(Emosi Visual: "${journalData.emotion}")` : "";

    const prompt = AI_PROMPTS.INSIGHT_GENERATION(journalText, visualContext, lang);
    const analysis = await aiClient.generateJSON(prompt, FALLBACKS.INSIGHT[lang], lang);

    try {
        return {
            tags: Array.isArray(analysis.tags) ? analysis.tags.slice(0, 3) : FALLBACKS.INSIGHT[lang].tags,
            chatbot_highlight: analysis.chatbot_highlight || FALLBACKS.INSIGHT[lang].chatbot_highlight,
            chatbot_suggestion: analysis.chatbot_suggestion || FALLBACKS.INSIGHT[lang].chatbot_suggestion,
            chatbot_strategy: analysis.chatbot_strategy || FALLBACKS.INSIGHT[lang].chatbot_strategy
        };
    } catch (error) {
        logger.error(`Insight Normalization Error: ${error.message}`);
        return FALLBACKS.INSIGHT[lang];
    }
};

const generatePeriodicJournalInsight = async (periodicData, lang = 'id') => {
    if (!periodicData || periodicData.length === 0) return FALLBACKS.PERIODIC[lang];

    const dataString = periodicData.map(d => `Tanggal: ${d.created_at}, Highlight: ${d.highlight || "-"}`).join("\n");
    const prompt = AI_PROMPTS.PERIODIC_INSIGHT(dataString, lang);
    
    return await aiClient.generateJSON(prompt, FALLBACKS.PERIODIC[lang], lang);
};

export default {
    generateJournalInsights,
    generatePeriodicJournalInsight
};