import journalRepository from "../../repositories/journal-repository.js";
import { ResponseError } from "../../error/response-error.js";
import journalAiService from "./journal-ai-service.js";
import { JOURNAL_MESSAGES, JOURNAL_DEFAULTS, JOURNAL_CATEGORIES, SORT_ORDER } from "../../constants/journal-constants.js";
import { logger } from "../../applications/logging.js";

// --- HELPER FUNCTIONS ---
const buildSearchFilters = (request) => {
    const filters = {};
    
    // Kategori
    if (request.category === JOURNAL_CATEGORIES.FAVORITES) {
        filters.is_draft = false;
        filters.is_favorite = true;
    } else if (request.category === JOURNAL_CATEGORIES.DRAFT) {
        filters.is_draft = true;
    } else if (request.category === JOURNAL_CATEGORIES.ALL || !request.category) {
        filters.is_draft = false;
    }

    // Tanggal
    if (request.date) {
        const searchDate = new Date(request.date).toISOString().split('T')[0];
        filters.start_date = `${searchDate}T00:00:00.000Z`;
        filters.end_date = `${searchDate}T23:59:59.999Z`;
    } else if (request.start_date && request.end_date) {
        filters.start_date = new Date(request.start_date).toISOString();
        filters.end_date = new Date(request.end_date).toISOString();
    } else if (request.month && request.year) {
        const year = parseInt(request.year);
        const month = parseInt(request.month);
        filters.start_date = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)).toISOString();
        filters.end_date = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString();
    } else if (request.year) {
        const year = parseInt(request.year);
        filters.start_date = new Date(Date.UTC(year, 0, 1, 0, 0, 0)).toISOString();
        filters.end_date = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)).toISOString();
    }

    return filters;
};

const applyKeywordFilter = (journals, keyword) => {
    if (!keyword) return journals;
    
    const lowerKeyword = keyword.toLowerCase();
    return journals.filter(journal => {
        const matchTitle = journal.title?.toLowerCase().includes(lowerKeyword);
        const matchNote = journal.note?.toLowerCase().includes(lowerKeyword);
        const matchTags = Array.isArray(journal.tags) && journal.tags.some(tag => tag.toLowerCase().includes(lowerKeyword));
        
        return matchTitle || matchNote || matchTags;
    });
};

const paginateData = (data, pageParam, sizeParam) => {
    const page = pageParam ? parseInt(pageParam) : 1;
    const size = sizeParam ? parseInt(sizeParam) : 10;
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;

    return {
        meta: { 
            page, 
            size, 
            total_data: data.length, 
            total_page: Math.ceil(data.length / size) 
        },
        data: data.slice(startIndex, endIndex)
    };
};

// --- MAIN SERVICES ---
const listJournal = async (user) => {
    const data = await journalRepository.find(user.uid, { is_draft: false });
    return { meta: { total_data: data.length }, data };
};

const searchJournal = async (user, request) => {
    const filters = buildSearchFilters(request);
    let journals = await journalRepository.find(user.uid, filters);

    journals = applyKeywordFilter(journals, request.keyword);

    return paginateData(journals, request.page, request.size);
};

const getDraftJournal = async (user) => {
    const data = await journalRepository.find(user.uid, { is_draft: true });
    return { meta: { total_data: data.length }, data };
};

const getFavoriteJournal = async (user) => {
    const data = await journalRepository.find(user.uid, { is_draft: false, is_favorite: true });
    return { meta: { total_data: data.length }, data };
};

const getLatestJournal = async (user) => {
    const data = await journalRepository.find(user.uid, { is_draft: false }, SORT_ORDER.DESC, 1);
    return data.length ? data[0] : null;
};

const getDailyInsight = async (user) => {
    const data = await journalRepository.find(user.uid, { is_draft: false }, SORT_ORDER.DESC, 1);

    if (data.length === 0) return null;

    let journalData = data[0];

    if (!journalData.chatbot_highlight) {
        try {
            const insights = await journalAiService.generateJournalInsights(journalData);
            if (insights) {
                const updates = {
                    chatbot_highlight: insights.chatbot_highlight,
                    chatbot_strategy: insights.chatbot_strategy,
                    chatbot_suggestion: insights.chatbot_suggestion,
                    updated_at: new Date().toISOString()
                };
                await journalRepository.update(journalData.id, updates);
                journalData.chatbot_highlight = insights.chatbot_highlight;
            }
        } catch (e) {
            logger.error(e.message);
        }
    }

    return {
        journal_id: journalData.id,
        date: journalData.created_at,
        expression: journalData.expression || JOURNAL_DEFAULTS.EXPRESSION,
        highlight: journalData.chatbot_highlight || JOURNAL_DEFAULTS.INSIGHT
    };
};

const getPeriodicInsight = async (user, request) => {
    const filters = {
        start_date: new Date(request.start_date).toISOString(),
        end_date: new Date(request.end_date).toISOString()
    };

    const data = await journalRepository.find(user.uid, filters, SORT_ORDER.ASC);

    if (data.length === 0) throw new ResponseError(404, JOURNAL_MESSAGES.NO_DATA_PERIOD);

    const periodicData = data.map(journal => ({
        expression: journal.expression,
        highlight: journal.chatbot_highlight,
        created_at: journal.created_at
    }));

    const analysisResult = await journalAiService.generatePeriodicJournalInsight(periodicData);

    return {
        start_date: request.start_date,
        end_date: request.end_date,
        expression: analysisResult?.expression || JOURNAL_DEFAULTS.EXPRESSION,
        highlight: analysisResult?.highlight || JOURNAL_DEFAULTS.INSIGHT
    };
};

const getMoodCalendar = async (user, request) => {
    const now = new Date();
    const year = request.year ? parseInt(request.year) : now.getFullYear();
    const month = request.month ? parseInt(request.month) : now.getMonth() + 1;
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const filters = {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
    };

    const data = await journalRepository.find(user.uid, filters, SORT_ORDER.DESC);

    const moods = {};
    data.forEach(journal => {
        if (!journal.is_draft) {
            const dateObj = new Date(journal.created_at);
            const day = dateObj.getUTCDate();
            if (!moods[day]) {
                moods[day] = { emotion: journal.emotion, expression: journal.expression };
            }
        }
    });

    return { year, month, moods };
};

export default {
    listJournal,
    searchJournal,
    getDraftJournal,
    getFavoriteJournal,
    getLatestJournal,
    getDailyInsight,
    getPeriodicInsight,
    getMoodCalendar
};