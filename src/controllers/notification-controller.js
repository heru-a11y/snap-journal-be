import notificationService from "../services/notification-service.js";

const list = async (req, res, next) => {
    try {
        const result = await notificationService.list(req.user, req.query, req.lang);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const markAsRead = async (req, res, next) => {
    try {
        const notificationId = req.params.id;
        const result = await notificationService.markAsRead(req.user, notificationId, req.lang);
        
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const deleteAll = async (req, res, next) => {
    try {
        const result = await notificationService.deleteAll(req.user, req.lang);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const deleteById = async (req, res, next) => {
    try {
        const notificationId = req.params.id;
        const result = await notificationService.deleteById(req.user, notificationId, req.lang);
        
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

export default {
    list,
    markAsRead,
    deleteAll,
    deleteById
}