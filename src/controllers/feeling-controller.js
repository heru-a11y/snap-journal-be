import feelingService from "../services/feeling/feeling-service.js";

const setToday = async (req, res, next) => {
    try {
        const result = await feelingService.setTodayFeeling(req.user, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const getToday = async (req, res, next) => {
    try {
        const result = await feelingService.getTodayFeeling(req.user);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const getHistory = async (req, res, next) => {
    try {
        const result = await feelingService.getFeelingHistory(req.user);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

export default {
    setToday,
    getToday,
    getHistory
};