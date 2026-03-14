import aiVisionService from "../ai/ai-vision-service.js";
import aiInsightService from "../ai/ai-insight-service.js";
import aiChatService from "../ai/ai-chat-service.js";
import aiTextService from "../ai/ai-text-service.js";
import journalAccessService from "./journal-access-service.js";
import journalRepository from "../../repositories/journal-repository.js";
import { JOURNAL_MESSAGES } from "../../constants/journal-constant.js";
import { FALLBACKS } from "../../constants/ai-constants.js";
import { logger } from "../../applications/logging.js";
import { ResponseError } from "../../error/response-error.js";

const analyzeVideo = async (videoFile) => {
    let aiAnalysis = { ...FALLBACKS.VISION }; 

    try {
        const filePath = videoFile?.path || videoFile; 
        
        if (filePath) {
            const result = await aiVisionService.analyzeVideo(filePath);
            if (result) aiAnalysis = result;
        }
    } catch (e) {
        logger.error(`Journal AI Service Error: ${e.message}`);
    }

    return aiAnalysis;
};

const analyze = async (user, journalId, lang = 'id') => {
    const data = await journalAccessService.checkAccess(user.uid, journalId, lang);
    const insights = await aiInsightService.generateJournalInsights(data, lang);
    if (!insights) throw new ResponseError(503, JOURNAL_MESSAGES[lang].AI_BUSY); 

    const updateData = {
        tags: insights.tags,
        chatbot_highlight: insights.chatbot_highlight,
        chatbot_suggestion: insights.chatbot_suggestion,
        chatbot_strategy: insights.chatbot_strategy,
        updated_at: new Date().toISOString()
    };
    
    await journalRepository.update(journalId, updateData);
    return { ...data, ...updateData };
};

const chat = async (user, journalId, request, lang = 'id') => {
    const data = await journalAccessService.checkAccess(user.uid, journalId, lang);
    const aiReply = await aiChatService.chatWithJournalContext(data, request.message, lang);
    return { journal_id: journalId, question: request.message, reply: aiReply };
};

const generateJournalInsights = async (journalData, lang = 'id') => {
    return await aiInsightService.generateJournalInsights(journalData, lang);
};

const generatePeriodicJournalInsight = async (periodicData, lang = 'id') => {
    return await aiInsightService.generatePeriodicJournalInsight(periodicData, lang);
};

const enhanceJournalText = async (request, lang = 'id') => {
    return await aiTextService.enhanceJournalText(request, lang);
};

export default {
    analyzeVideo,
    analyze,
    chat,
    generateJournalInsights,
    generatePeriodicJournalInsight,
    enhanceJournalText
};