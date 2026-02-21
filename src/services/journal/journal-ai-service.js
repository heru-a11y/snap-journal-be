import aiHelperService from "../ai-helper-service.js";
import journalAccessService from "./journal-access-service.js";
import journalRepository from "../../repositories/journal-repository.js";
import { JOURNAL_MESSAGES } from "./journal-constants.js";
import { logger } from "../../applications/logging.js";
import { ResponseError } from "../../error/response-error.js";

const analyzeVideo = async (videoFile) => {
    let aiAnalysis = { emotion: null, expression: null, confidence: null };
    try {
        if (videoFile) {
            const result = await aiHelperService.analyzeVideo(videoFile);
            if (result) aiAnalysis = result;
        }
    } catch (e) {
        logger.error(e.message);
    }
    return aiAnalysis;
};

const analyze = async (user, journalId) => {
    const data = await journalAccessService.checkAccess(user.uid, journalId);
    
    const insights = await aiHelperService.generateJournalInsights(data);
    if (!insights) throw new ResponseError(503, JOURNAL_MESSAGES.AI_BUSY); 

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

const chat = async (user, journalId, request) => {
    const data = await journalAccessService.checkAccess(user.uid, journalId);
    const aiReply = await aiHelperService.chatWithJournalContext(data, request.message);
    return { journal_id: journalId, question: request.message, reply: aiReply };
};

const generateJournalInsights = async (journalData) => {
    return await aiHelperService.generateJournalInsights(journalData);
};

const generatePeriodicJournalInsight = async (periodicData) => {
    return await aiHelperService.generatePeriodicJournalInsight(periodicData);
};

const enhanceJournalText = async (request) => {
    return await aiHelperService.enhanceJournalText(request);
};

export default {
    analyzeVideo,
    analyze,
    chat,
    generateJournalInsights,
    generatePeriodicJournalInsight,
    enhanceJournalText
};