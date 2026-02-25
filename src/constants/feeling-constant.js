import { DateTime } from "luxon";

export const FEELING_CONSTANTS = {
    COLLECTION: {
        USERS: "users",
        FEELINGS: "feelings"
    },
    QUERY: {
        SORT_DESC: "desc",
        DEFAULT_LIMIT: 30
    },
    FIELD: {
        MOOD: "mood",
        DATE: "date",
        CREATED_AT: "created_at",
        UPDATED_AT: "updated_at"
    },
    MESSAGE: {
        id: {
            SUCCESS_SAVE: "Feeling hari ini berhasil disimpan."
        },
        en: {
            SUCCESS_SAVE: "Today's feeling saved successfully."
        }
    }
};

export const getTodayDateString = (timeZone = 'Asia/Jakarta') => {
    return DateTime.now().setZone(timeZone).toFormat('yyyy-MM-dd');
};

export const getNowISOString = () => DateTime.now().toISO();