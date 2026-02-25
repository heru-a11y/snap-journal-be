import { ResponseError } from "../../error/response-error.js";
import { v4 as uuidv4 } from "uuid";
import journalRepository from "../../repositories/journal-repository.js";
import userRepository from "../../repositories/user-repository.js";
import journalAccessService from "./journal-access-service.js";
import journalMediaService from "./journal-media-service.js";
import journalAiService from "./journal-ai-service.js";
import { JOURNAL_MESSAGES, JOURNAL_DEFAULTS } from "../../constants/journal-constant.js";
import { USER_FIELDS } from "../../constants/user-constant.js";

const validatePublishRequest = (title, hasVideo, lang = 'id') => {
    const defaultTitle = JOURNAL_DEFAULTS[lang].DRAFT_TITLE;
    
    if (!title || title.trim() === "" || title === defaultTitle) {
        throw new ResponseError(400, JOURNAL_MESSAGES[lang].TITLE_REQUIRED);
    }
    if (!hasVideo) {
        throw new ResponseError(400, JOURNAL_MESSAGES[lang].VIDEO_REQUIRED);
    }
};

const buildJournalData = (id, userId, request, aiAnalysis, isDraft, timestamp, lang = 'id') => {
    return {
        id,
        user_id: userId,
        title: request.title || (isDraft ? JOURNAL_DEFAULTS[lang].DRAFT_TITLE : ""),
        note: request.note || "",
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

const buildMediaData = (journalId, videoUrl, images, timestamp) => {
    const mediaList = [];
    if (videoUrl) {
        mediaList.push({
            id: uuidv4(), journal_id: journalId, type: 'video', url: videoUrl, created_at: timestamp
        });
    }
    if (images && Array.isArray(images)) {
        images.slice(0, 3).forEach(url => {
            mediaList.push({
                id: uuidv4(), journal_id: journalId, type: 'image', url: url, created_at: timestamp
            });
        });
    }
    return mediaList;
};

const createJournal = async (user, request, videoFile, lang = 'id') => {
    validatePublishRequest(request.title, !!videoFile, lang);

    const journalId = uuidv4();
    const now = new Date().toISOString();
    
    let aiAnalysis = null;
    if (videoFile) {
        aiAnalysis = await journalAiService.analyzeVideo(videoFile);
    }
    
    const videoUrl = await journalMediaService.handleVideoUpload(user, videoFile);
    const journalData = buildJournalData(journalId, user.uid, request, aiAnalysis, false, now, lang);
    const mediaList = buildMediaData(journalId, videoUrl, request.images, now);

    await journalRepository.save(journalData, mediaList);

    return { ...journalData, media: mediaList };
};

const createJournalDraft = async (user, request, videoFile, lang = 'id') => {
    const journalId = uuidv4();
    const now = new Date().toISOString();
    
    const videoUrl = await journalMediaService.handleVideoUpload(user, videoFile);
    const journalData = buildJournalData(journalId, user.uid, request, null, true, now, lang);
    const mediaList = buildMediaData(journalId, videoUrl, request.images, now);

    await journalRepository.save(journalData, mediaList);
    
    return { ...journalData, media: mediaList };
};

const updateJournal = async (user, request, journalId, videoFile, lang = 'id') => {
    const currentData = await journalAccessService.checkAccess(user.uid, journalId, lang);
    
    const now = new Date().toISOString();
    const currentMedia = currentData.media || [];
    const currentImages = currentMedia.filter(m => m.type === 'image');
    const currentVideo = currentMedia.find(m => m.type === 'video');

    const updates = { updated_at: now };
    let newMediaList = [];
    let deleteMediaIds = [];
    let isContentChanged = false;

    if (request.title !== undefined && request.title !== currentData.title) {
        updates.title = request.title;
        isContentChanged = true;
    }
    
    if (request.note !== undefined && request.note !== currentData.note) {
        updates.note = request.note;
        isContentChanged = true;
    }

    if (videoFile) {
        if (currentVideo) {
            await journalMediaService.handleVideoDelete(user, currentVideo.url);
            deleteMediaIds.push(currentVideo.id);
        }
        const url = await journalMediaService.handleVideoUpload(user, videoFile);
        const ai = await journalAiService.analyzeVideo(videoFile);
        
        updates.emotion = ai.emotion;
        updates.expression = ai.expression;
        updates.confidence = ai.confidence;
        
        newMediaList.push({ id: uuidv4(), journal_id: journalId, type: 'video', url: url, created_at: now });
        isContentChanged = true;
    }

    if (request.images && Array.isArray(request.images)) {
        const requestedUrls = request.images.slice(0, 3);
        const currentUrls = currentImages.map(img => img.url);
        
        const deletedImages = currentImages.filter(img => !requestedUrls.includes(img.url));
        if (deletedImages.length > 0) {
            await journalMediaService.handleJournalImagesDelete(user, deletedImages.map(d => d.url));
            deleteMediaIds.push(...deletedImages.map(d => d.id));
            isContentChanged = true;
        }
        
        const addedUrls = requestedUrls.filter(url => !currentUrls.includes(url));
        addedUrls.forEach(url => {
            newMediaList.push({ id: uuidv4(), journal_id: journalId, type: 'image', url: url, created_at: now });
            isContentChanged = true;
        });
    }

    if (isContentChanged) {
        updates.tags = null;
        updates.chatbot_highlight = null;
        updates.chatbot_suggestion = null;
        updates.chatbot_strategy = null;
    }

    await journalRepository.update(journalId, updates, newMediaList, deleteMediaIds);
    
    return await journalAccessService.checkAccess(user.uid, journalId, lang);
};

const getDetailJournal = async (user, journalId, lang = 'id') => {
    return await journalAccessService.checkAccess(user.uid, journalId, lang);
};

const toggleFavorite = async (user, journalId, request, lang = 'id') => {
    await journalAccessService.checkAccess(user.uid, journalId, lang);
    const isFavorite = request.is_favorite === true || request.is_favorite === "true";

    await journalRepository.update(journalId, {
        is_favorite: isFavorite,
        updated_at: new Date().toISOString()
    });

    return { id: journalId, is_favorite: isFavorite };
};

const toggleDraft = async (user, journalId, request, lang = 'id') => {
    const currentData = await journalAccessService.checkAccess(user.uid, journalId, lang);
    const isDraft = request.is_draft === true || request.is_draft === "true";
    const now = new Date().toISOString();

    if (isDraft === false) {
        const hasVideo = currentData.media && currentData.media.some(m => m.type === 'video');
        validatePublishRequest(currentData.title, hasVideo, lang);
    }

    const updates = { is_draft: isDraft, updated_at: now };

    if (currentData.is_draft === true && isDraft === false) {
        await userRepository.update(user.uid, {
            [USER_FIELDS.LAST_ENTRY]: now,
            [USER_FIELDS.LAST_JOURNAL_ID]: journalId,
            [USER_FIELDS.LAST_JOURNAL_SUMMARY]: currentData.summary || null,
            [USER_FIELDS.LAST_JOURNAL_EMOTION]: currentData.emotion || null
        });
    }

    await journalRepository.update(journalId, updates);

    return {
        id: journalId,
        is_draft: isDraft,
        message: isDraft ? JOURNAL_MESSAGES[lang].DRAFT_SAVED : JOURNAL_MESSAGES[lang].PUBLISHED
    };
};

const deleteJournal = async (user, journalId, lang = 'id') => {
    const journalData = await journalAccessService.checkAccess(user.uid, journalId, lang);

    const media = journalData.media || [];
    const imagesUrl = media.filter(m => m.type === 'image').map(m => m.url);
    const videoObj = media.find(m => m.type === 'video');

    if (videoObj) await journalMediaService.handleVideoDelete(user, videoObj.url);
    if (imagesUrl.length > 0) await journalMediaService.handleJournalImagesDelete(user, imagesUrl);
    
    await journalRepository.deleteById(journalId);

    return { message: JOURNAL_MESSAGES[lang].DELETED };
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