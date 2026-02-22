import feelingRepository from "../../repositories/feeling-repository.js";
import { FEELING_CONSTANTS, getTodayDateString, getNowISOString } from "./feeling-constant.js";

const setTodayFeeling = async (user, request) => {
    const today = getTodayDateString();
    const now = getNowISOString();

    const existingFeeling = await feelingRepository.getFeelingByDate(user.uid, today);

    const data = {
        [FEELING_CONSTANTS.FIELD.MOOD]: request.mood,
        [FEELING_CONSTANTS.FIELD.DATE]: today,
        [FEELING_CONSTANTS.FIELD.UPDATED_AT]: now
    };

    if (!existingFeeling) {
        data[FEELING_CONSTANTS.FIELD.CREATED_AT] = now;
    }

    await feelingRepository.saveFeeling(user.uid, today, data);

    return {
        [FEELING_CONSTANTS.FIELD.DATE]: today,
        [FEELING_CONSTANTS.FIELD.MOOD]: request.mood,
        message: FEELING_CONSTANTS.MESSAGE.SUCCESS_SAVE
    };
};

const getTodayFeeling = async (user) => {
    const today = getTodayDateString();
    return await feelingRepository.getFeelingByDate(user.uid, today);
};

const getFeelingHistory = async (user) => {
    return await feelingRepository.getFeelingHistory(user.uid);
};

export default {
    setTodayFeeling,
    getTodayFeeling,
    getFeelingHistory
};