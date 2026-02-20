import journalService from "../services/journal-service.js";
import uploadService from "../services/upload-service.js";
import deleteService from "../services/delete-service.js";

const uploadEditorImage = async (req, res, next) => {
    try {
        const user = req.user;
        const file = req.files['image'] ? req.files['image'][0] : null;

        const result = await uploadService.uploadEditorImage(user, file);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
};

const deleteEditorImage = async (req, res, next) => {
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
        const files = req.files || {};
        const videoFile = files['video'] ? files['video'][0] : null;

        const result = await journalService.createJournal(user, request, videoFile);
        res.status(201).json({ data: result });
    } catch (e) {
        next(e);
    }
}

const createJournalDraft = async (req, res, next) => {
    try {
        const user = req.user;
        const request = req.body;
        
        const files = req.files || {};
        const videoFile = files['video'] ? files['video'][0] : null;

        const result = await journalService.createJournalDraft(user, request, videoFile);

        res.status(201).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const updateJournal = async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;
        const request = req.body;

        const files = req.files || {};
        const videoFile = files['video'] ? files['video'][0] : null;

        const result = await journalService.updateJournal(user, request, id, videoFile);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const listJournal = async (req, res, next) => {
    try {
        const result = await journalService.listJournal(req.user);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
}
const searchJournal = async (req, res, next) => {
    try {
        const user = req.user;
        const request = req.query;

        const result = await journalService.searchJournal(user, request);

        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
}

const getDraftJournal = async (req, res, next) => {
    try {
        const result = await journalService.getDraftJournal(req.user);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
}

const getFavoriteJournal = async (req, res, next) => {
    try {
        const result = await journalService.getFavoriteJournal(req.user);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
}

const getDetailJournal = async (req, res, next) => {
    try {
        const journalId = req.params.id;
        const result = await journalService.getDetailJournal(req.user, journalId);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const getLatestJournal = async (req, res, next) => {
    try {
        const result = await journalService.getLatestJournal(req.user);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const getDailyInsight = async (req, res, next) => {
    try {
        const result = await journalService.getDailyInsight(req.user);
        
        if (!result) {
            return res.status(200).json({
                message: "Belum ada jurnal untuk dianalisis.",
                data: null
            });
        }

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const toggleFavorite = async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;
        const request = req.body;

        const result = await journalService.toggleFavorite(user, id, request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const toggleDraft = async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;
        const request = req.body;

        const result = await journalService.toggleDraft(user, id, request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const deleteJournal = async (req, res, next) => {
    try {
        const journalId = req.params.id;
        
        const result = await journalService.deleteJournal(req.user, journalId);
        
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const enhanceText = async (req, res, next) => {
    try {
        const result = await journalService.enhanceJournalText(req.user, req.body);
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

        const result = await journalService.chat(user, id, request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const analyze = async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id;

        const result = await journalService.analyze(user, id);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const getMoodCalendar = async (req, res, next) => {
    try {
        const user = req.user;
        const request = req.query;

        const result = await journalService.getMoodCalendar(user, request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

export default {
    uploadEditorImage,
    deleteEditorImage,
    createJournal,
    createJournalDraft,
    listJournal,
    searchJournal,
    getDraftJournal,
    getFavoriteJournal,
    getDetailJournal,
    getLatestJournal,
    getDailyInsight,
    updateJournal,
    toggleFavorite,
    toggleDraft,
    deleteJournal,
    enhanceText,
    chat,
    analyze,
    getMoodCalendar
}