import userRepository from "../../repositories/user-repository.js";
import { admin } from "../../applications/firebase.js";
import { ResponseError } from "../../error/response-error.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../constants/user-constant.js";
import { logger } from "../../applications/logging.js";

const getProfile = async (user, lang = 'id') => {
    const userData = await userRepository.findById(user.uid);
    if (!userData) throw new ResponseError(404, ERROR_MESSAGES[lang].USER_NOT_FOUND);

    return {
        uid: user.uid,
        name: userData.name,
        email: userData.email,
        bio: userData.bio || null,
        photoUrl: userData.photoUrl || null,
        fcm_token: userData.fcm_token || null,
        language: userData.language || 'id'
    };
}

const updateProfile = async (user, request, lang = 'id') => {
    const userData = await userRepository.findById(user.uid);
    if (!userData) throw new ResponseError(404, ERROR_MESSAGES[lang].USER_NOT_FOUND);

    const updateData = { updated_at: new Date().toISOString() };
    const authUpdates = {};

    if (request.name) {
        updateData.name = request.name;
        authUpdates.displayName = request.name;
    }
    if (request.bio) {
        updateData.bio = request.bio;
    }

    if (Object.keys(authUpdates).length > 0) {
        try {
            await admin.auth().updateUser(user.uid, authUpdates);
        } catch (error) {
            logger.error(`[UserProfileService] Gagal update data di Firebase Auth: ${error.message}`);
        }
    }

    await userRepository.update(user.uid, updateData);
    return await userRepository.findById(user.uid);
}

const updateLanguage = async (user, request, lang = 'id') => {
    const userData = await userRepository.findById(user.uid);
    if (!userData) throw new ResponseError(404, ERROR_MESSAGES[lang].USER_NOT_FOUND);

    await userRepository.update(user.uid, {
        language: request.language,
        updated_at: new Date().toISOString()
    });

    return {
        message: SUCCESS_MESSAGES[lang].LANGUAGE_UPDATED,
        language: request.language
    };
}

const setFcmToken = async (user, request, lang = 'id') => {
    const userData = await userRepository.findById(user.uid);
    if (!userData) throw new ResponseError(404, ERROR_MESSAGES[lang].USER_NOT_FOUND);

    await userRepository.update(user.uid, {
        fcm_token: request.token,
        updated_at: new Date().toISOString()
    });

    return {
        message: SUCCESS_MESSAGES[lang].FCM_SAVED,
        user_id: user.uid
    };
}

export default { 
    getProfile, 
    updateProfile, 
    setFcmToken,
    updateLanguage
}