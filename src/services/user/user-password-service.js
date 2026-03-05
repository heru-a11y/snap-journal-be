import userRepository from "../../repositories/user-repository.js";
import { admin } from "../../applications/firebase.js";
import { ResponseError } from "../../error/response-error.js";
import axios from "axios";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../constants/user-constant.js";
import { logger } from "../../applications/logging.js";

const GOOGLE_API_KEY = process.env.GOOGLE_CLIENT_API_KEY;

const changePassword = async (user, request, lang = 'id') => {
    const { oldPassword, newPassword } = request;

    const userData = await userRepository.findById(user.uid);
    if (!userData) throw new ResponseError(404, ERROR_MESSAGES[lang].USER_NOT_FOUND);

    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${GOOGLE_API_KEY}`;
    try {
        await axios.post(verifyUrl, {
            email: userData.email,
            password: oldPassword,
            returnSecureToken: true
        });
    } catch (error) {
        logger.warn(`[UserPasswordService] Percobaan password lama salah untuk UID ${user.uid}`);
        throw new ResponseError(401, ERROR_MESSAGES[lang].OLD_PASSWORD_INCORRECT);
    }

    try {
        await admin.auth().updateUser(user.uid, { password: newPassword });
        await admin.auth().revokeRefreshTokens(user.uid);
    } catch (error) {
        logger.error(`[UserPasswordService] Gagal update password di Auth untuk UID ${user.uid}: ${error.message}`);
        throw new ResponseError(500, `${ERROR_MESSAGES[lang].PASSWORD_UPDATE_FAILED}: ${error.message}`);
    }

    return { message: SUCCESS_MESSAGES[lang].PASSWORD_UPDATED };
}

export default { 
    changePassword 
}