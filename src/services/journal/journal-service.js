import { ResponseError } from "../../error/response-error.js";
import { v4 as uuidv4 } from "uuid";
import journalRepository from "../../repositories/journal-repository.js";
import journalAccessService from "./journal-access-service.js";
import journalMediaService from "./journal-media-service.js";
import journalAiService from "./journal-ai-service.js";
import { JOURNAL_MESSAGES, JOURNAL_DEFAULTS } from "../../constants/journal-constants.js";

const validatePublishRequest = (title, hasVideo) => {
    if (!title || title.trim() === "" || title === JOURNAL_DEFAULTS.DRAFT_TITLE) {
        throw new ResponseError(400, JOURNAL_MESSAGES.TITLE_REQUIRED);
    }
    if (!hasVideo) {
        throw new ResponseError(400, JOURNAL_MESSAGES.VIDEO_REQUIRED);
    }
};

const buildJournalData = (id, userId, request, videoUrl, aiAnalysis, isDraft, timestamp) => {
    return {
        id,
        user_id: userId,
        title: request.title || (isDraft ? JOURNAL_DEFAULTS.DRAFT_TITLE : ""),
        note: request.note || "",
        video_url: videoUrl,
        is_favorite: false,
        is_draft: isDraft,
        emotion: aiAnalysis?.emotion || null,
        expression: aiAnalysis?.expression || null,
        confidence: aiAnalysis?.confidence || null,
        chatbot_suggestion: null,
        chatbot_highlight: null,
        chatbot_strategy: null,
        tags: null,
        created_at: timestamp,
        updated_at: timestamp
    };
};

const buildUpdatePayload = (currentData, request, videoData, timestamp) => {
    const updates = { updated_at: timestamp };
    let isChanged = false;

    if (request.title !== undefined && request.title.trim() !== "") {
        updates.title = request.title;
        if (request.title !== currentData.title) isChanged = true;
    }
    
    if (request.note !== undefined) {
        updates.note = request.note;
        if (request.note !== currentData.note) isChanged = true;
    }
    
    if (videoData) {
        updates.video_url = videoData.url;
        if (videoData.ai && videoData.ai.emotion) {
            updates.emotion = videoData.ai.emotion;
            updates.expression = videoData.ai.expression;
            updates.confidence = videoData.ai.confidence;
        }
        isChanged = true;
    }

    if (isChanged) {
        updates.tags = null;
        updates.chatbot_highlight = null;
        updates.chatbot_suggestion = null;
        updates.chatbot_strategy = null;
    }

    return updates;
};

const processVideoUpdate = async (user, currentVideoUrl, newVideoFile) => {
    await journalMediaService.handleVideoDelete(user, currentVideoUrl); 
    const url = await journalMediaService.handleVideoUpload(user, newVideoFile);
    const ai = await journalAiService.analyzeVideo(newVideoFile);
    return { url, ai };
};

const createJournal = async (user, request, videoFile) => {
    validatePublishRequest(request.title, !!videoFile);

    const journalId = uuidv4();
    const now = new Date().toISOString();
    
    let aiAnalysis = null;
    if (videoFile) {
        aiAnalysis = await journalAiService.analyzeVideo(videoFile);
    }
    
    const videoUrl = await journalMediaService.handleVideoUpload(user, videoFile);
    const journalData = buildJournalData(
        journalId, 
        user.uid, 
        request, 
        videoUrl, 
        aiAnalysis, 
        false, 
        now
    );

    await journalRepository.save(journalData);
    await journalRepository.updateUserLastEntry(user.uid, now);

    return journalData;
};

const createJournalDraft = async (user, request, videoFile) => {
    const journalId = uuidv4();
    const now = new Date().toISOString();
    
    const videoUrl = await journalMediaService.handleVideoUpload(user, videoFile);
    const journalData = buildJournalData(journalId, user.uid, request, videoUrl, null, true, now);

    await journalRepository.save(journalData);
    
    return journalData;
};

const updateJournal = async (user, request, journalId, videoFile) => {
    const currentData = await journalAccessService.checkAccess(user.uid, journalId);
    
    const now = new Date().toISOString();
    let videoData = null;
    
    if (videoFile) {
        videoData = await processVideoUpdate(user, currentData.video_url, videoFile);
    }

    const updates = buildUpdatePayload(currentData, request, videoData, now);
    await journalRepository.update(journalId, updates);
    
    return { ...currentData, ...updates };
};

const getDetailJournal = async (user, journalId) => {
    return await journalAccessService.checkAccess(user.uid, journalId);
};

const toggleFavorite = async (user, journalId, request) => {
    await journalAccessService.checkAccess(user.uid, journalId);
    const isFavorite = request.is_favorite === true || request.is_favorite === "true";

    await journalRepository.update(journalId, {
        is_favorite: isFavorite,
        updated_at: new Date().toISOString()
    });

    return { id: journalId, is_favorite: isFavorite };
};

const toggleDraft = async (user, journalId, request) => {
    const currentData = await journalAccessService.checkAccess(user.uid, journalId);
    const isDraft = request.is_draft === true || request.is_draft === "true";
    const now = new Date().toISOString();

    if (isDraft === false) {
        validatePublishRequest(currentData.title, !!currentData.video_url);
    }

    const updates = { is_draft: isDraft, updated_at: now };

    if (currentData.is_draft === true && isDraft === false) {
        await journalRepository.updateUserLastEntry(user.uid, now);
    }

    await journalRepository.update(journalId, updates);

    return {
        id: journalId,
        is_draft: isDraft,
        message: isDraft ? JOURNAL_MESSAGES.DRAFT_SAVED : JOURNAL_MESSAGES.PUBLISHED
    };
};

const deleteJournal = async (user, journalId) => {
    const journalData = await journalAccessService.checkAccess(user.uid, journalId);

    await journalMediaService.handleVideoDelete(user, journalData.video_url);
    await journalMediaService.handleEmbeddedImagesDelete(user, journalData.note);
    await journalRepository.deleteById(journalId);

    return { message: JOURNAL_MESSAGES.DELETED };
};

export default {
    createJournal,
    createJournalDraft,
    updateJournal,
    getDetailJournal,
    toggleFavorite,
    toggleDraft,
    deleteJournal
};