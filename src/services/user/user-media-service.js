import userRepository from "../../repositories/user-repository.js";
import { admin } from "../../applications/firebase.js";
import { ResponseError } from "../../error/response-error.js";
import uploadService from "../upload-service.js";
import deleteService from "../delete-service.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../constants/user-constant.js";
import { logger } from "../../applications/logging.js";

const updateProfilePicture = async (user, file, lang = 'id') => {
    if (!file) throw new ResponseError(400, ERROR_MESSAGES[lang].FILE_REQUIRED);

    const userData = await userRepository.findById(user.uid);
    if (!userData) throw new ResponseError(404, ERROR_MESSAGES[lang].USER_NOT_FOUND);

    if (userData.photoUrl) {
        try {
            await deleteService.removeFile(user, userData.photoUrl);
        } catch (error) {
            logger.warn(`[UserMediaService] Gagal menghapus foto lama: ${error.message}`);
        }
    }

    const newPhotoUrl = await uploadService.uploadProfilePicture(user, file);
    const updateTime = new Date().toISOString();
    
    await userRepository.update(user.uid, {
        photoUrl: newPhotoUrl,
        updated_at: updateTime
    });

    try {
        await admin.auth().updateUser(user.uid, { photoURL: newPhotoUrl });
    } catch (error) {
        logger.error(`[UserMediaService] Gagal update photoURL di Auth: ${error.message}`);
    }

    return { photoUrl: newPhotoUrl, updated_at: updateTime };
}

const removeProfilePicture = async (user, lang = 'id') => {
    const userData = await userRepository.findById(user.uid);
    if (!userData) throw new ResponseError(404, ERROR_MESSAGES[lang].USER_NOT_FOUND);

    if (!userData.photoUrl) throw new ResponseError(400, ERROR_MESSAGES[lang].NO_PROFILE_PICTURE);

    try {
        await deleteService.removeFile(user, userData.photoUrl);
    } catch (error) {
        logger.warn(`[UserMediaService] File fisik mungkin sudah hilang atau gagal dihapus: ${error.message}`);
    }

    await userRepository.update(user.uid, {
        photoUrl: null,
        updated_at: new Date().toISOString()
    });

    try {
        await admin.auth().updateUser(user.uid, { photoURL: null });
    } catch (error) {
        logger.error(`[UserMediaService] Gagal hapus photoURL di Auth: ${error.message}`);
    }

    return { message: SUCCESS_MESSAGES[lang].PROFILE_PICTURE_DELETED };
}

export default { 
    updateProfilePicture, 
    removeProfilePicture 
}