import journalService from "../services/journal/journal-service.js";
import journalQueryService from "../services/journal/journal-query-service.js";
import journalAiService from "../services/journal/journal-ai-service.js";
import uploadService from "../services/upload-service.js";
import deleteService from "../services/delete-service.js";
import { JOURNAL_MESSAGES } from "../constants/journal-constant.js";

// Helper untuk memastikan images selalu berupa array
const parseImagesField = (images) => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
        return [images];
    }
};

const uploadJournalImage = async (req, res, next) => {
    try {
        const user = req.user;
        const file = req.files['image'] ? req.files['image'][0] : null;
        const result = await uploadService.uploadJournalImage(user, file);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const deleteJournalImage = async (req, res, next) => {
    try {
        const user = req.user;
        const { file_url } = req.body; 

        if (!file_url) {
            return res.status(400).json({ errors: "URL file wajib disertakan." });
        }

        const result = await deleteService.removeFile(user, file_url);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const createJournal = async (req, res, next) => {
    try {
        const user = req.user;
        const request = req.body;
        request.images = parseImagesField(request.images);

        const videoFile = req.files?.['video'] ? req.files['video'][0] : null;
        const result = await journalService.createJournal(user, request, videoFile, req.lang);
        
        res.status(201).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const createJournalDraft = async (req, res, next) => {
    try {
        const user = req.user;
        const request = req.body;
        request.images = parseImagesField(request.images);

        const files = req.files || {};
        const videoFile = files['video'] ? files['video'][0] : null;

        const result = await journalService.createJournalDraft(user, request, videoFile, req.lang);
        res.status(201).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const updateJournal = async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;
        const request = req.body;
        request.images = parseImagesField(request.images);

        const files = req.files || {};
        const videoFile = files['video'] ? files['video'][0] : null;

        const result = await journalService.updateJournal(user, request, id, videoFile, req.lang);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const listJournal = async (req, res, next) => {
    try {
        const result = await journalQueryService.listJournal(req.user);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
};

const searchJournal = async (req, res, next) => {
    try {
        const user = req.user;
        const request = req.query;
        const result = await journalQueryService.searchJournal(user, request);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
};

const getDraftJournal = async (req, res, next) => {
    try {
        const result = await journalQueryService.getDraftJournal(req.user);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
};

const getFavoriteJournal = async (req, res, next) => {
    try {
        const result = await journalQueryService.getFavoriteJournal(req.user);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
};

const getDetailJournal = async (req, res, next) => {
    try {
        const journalId = req.params.id;
        const result = await journalService.getDetailJournal(req.user, journalId, req.lang);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const getLatestJournal = async (req, res, next) => {
    try {
        const result = await journalQueryService.getLatestJournal(req.user);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const getDailyInsight = async (req, res, next) => {
    try {
        const result = await journalQueryService.getDailyInsight(req.user, req.lang);
        if (!result) {
            return res.status(200).json({ 
                message: JOURNAL_MESSAGES[req.lang].NO_INSIGHT, 
                data: null 
            });
        }
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const getPeriodicInsight = async (req, res, next) => {
    try {
        const user = req.user;
        const request = req.query; 
        const result = await journalQueryService.getPeriodicInsight(user, request, req.lang);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const getTopMood = async (req, res, next) => {
    try {
        const user = req.user;
        const request = req.query;
        const result = await journalQueryService.getTopMood(user, request, req.lang);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const toggleFavorite = async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;
        const request = req.body;
        const result = await journalService.toggleFavorite(user, id, request, req.lang);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const toggleDraft = async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;
        const request = req.body;
        const result = await journalService.toggleDraft(user, id, request, req.lang);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const deleteJournal = async (req, res, next) => {
    try {
        const journalId = req.params.id;
        const result = await journalService.deleteJournal(req.user, journalId, req.lang);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const enhanceText = async (req, res, next) => {
    try {
        const result = await journalAiService.enhanceJournalText(req.body, req.lang);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const chat = async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;
        const request = req.body; 
        const result = await journalAiService.chat(user, id, request, req.lang);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const analyze = async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;
        const result = await journalAiService.analyze(user, id, req.lang);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const getMoodCalendar = async (req, res, next) => {
    try {
        const user = req.user;
        const request = req.query;
        const result = await journalQueryService.getMoodCalendar(user, request);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

export default {
    uploadJournalImage,
    deleteJournalImage,
    createJournal,
    createJournalDraft,
    listJournal,
    searchJournal,
    getDraftJournal,
    getFavoriteJournal,
    getDetailJournal,
    getLatestJournal,
    getDailyInsight,
    getPeriodicInsight,
    getTopMood,
    updateJournal,
    toggleFavorite,
    toggleDraft,
    deleteJournal,
    enhanceText,
    chat,
    analyze,
    getMoodCalendar
};