import notificationRepository from "../repositories/notification-repository.js";
import { ResponseError } from "../error/response-error.js";
import { logger } from "../applications/logging.js";
import { 
    NOTIFICATION_FIELDS, 
    NOTIFICATION_QUERY, 
    NOTIFICATION_MESSAGES 
} from "../constants/notification-constant.js";

const getAndValidateNotification = async (userId, notificationId) => {
    const doc = await notificationRepository.findById(userId, notificationId);

    if (!doc.exists) {
        throw new ResponseError(404, NOTIFICATION_MESSAGES.NOT_FOUND);
    }

    return doc.data();
};

const list = async (user, request) => {
    try {
        const requestedLimit = request.limit ? parseInt(request.limit) : NOTIFICATION_QUERY.DEFAULT_LIMIT;
        const limit = Math.min(requestedLimit, NOTIFICATION_QUERY.MAX_LIMIT);
        
        const snapshot = await notificationRepository.findByUserId(user.uid, limit);

        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => {
            const rawData = doc.data();
            const content = rawData[NOTIFICATION_FIELDS.DATA] || {};

            return {
                id: doc.id,
                title: content.title || NOTIFICATION_MESSAGES.DEFAULT_TITLE,
                message: content.message || rawData[NOTIFICATION_FIELDS.TYPE] || NOTIFICATION_MESSAGES.DEFAULT_MESSAGE, 
                read_at: rawData[NOTIFICATION_FIELDS.READ_AT] || null,
                created_at: rawData[NOTIFICATION_FIELDS.CREATED_AT] 
            };
        });
    } catch (e) {
        if (e instanceof ResponseError) throw e;
        logger.error(`Error in notification list service: ${e.message}`);
        throw new ResponseError(500, "Internal Server Error");
    }
};

const markAsRead = async (user, notificationId) => {
    try {
        const data = await getAndValidateNotification(user.uid, notificationId);

        if (data[NOTIFICATION_FIELDS.READ_AT]) {
            return {
                id: notificationId,
                read_at: data[NOTIFICATION_FIELDS.READ_AT],
                message: NOTIFICATION_MESSAGES.MARKED_AS_READ
            };
        }

        const now = new Date().toISOString();
        await notificationRepository.updateReadStatus(user.uid, notificationId, now);

        return {
            id: notificationId,
            read_at: now,
            message: NOTIFICATION_MESSAGES.MARKED_AS_READ
        };
    } catch (e) {
        if (e instanceof ResponseError) throw e;
        logger.error(`Error in notification markAsRead service: ${e.message}`);
        throw new ResponseError(500, "Internal Server Error");
    }
};

const deleteAll = async (user) => {
    try {
        const hasDeleted = await notificationRepository.deleteBatchByUserId(user.uid);

        if (!hasDeleted) {
            return { message: NOTIFICATION_MESSAGES.NONE_TO_DELETE };
        }

        return { message: NOTIFICATION_MESSAGES.ALL_DELETED };
    } catch (e) {
        logger.error(`Error in notification deleteAll service: ${e.message}`);
        throw new ResponseError(500, "Internal Server Error");
    }
};

const deleteById = async (user, notificationId) => {
    try {
        await getAndValidateNotification(user.uid, notificationId);
        await notificationRepository.deleteById(user.uid, notificationId);

        return { message: NOTIFICATION_MESSAGES.ID_DELETED };
    } catch (e) {
        if (e instanceof ResponseError) throw e;
        logger.error(`Error in notification deleteById service: ${e.message}`);
        throw new ResponseError(500, "Internal Server Error");
    }
};

export default {
    list,
    markAsRead,
    deleteAll,
    deleteById
};