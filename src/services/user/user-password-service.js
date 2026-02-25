import userRepository from "../../repositories/user-repository.js";
import { admin } from "../../applications/firebase.js";
import { ResponseError } from "../../error/response-error.js";
import emailService from "../email-service.js";
import axios from "axios";
import { generateOtp, checkLockout, validateOtpAndLockout } from "../../utils/security-util.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../constants/user-constant.js";
import { logger } from "../../applications/logging.js";

const GOOGLE_API_KEY = process.env.GOOGLE_CLIENT_API_KEY;

const requestPasswordChange = async (user, request, lang = 'id') => {
    const userData = await userRepository.findById(user.uid);
    if (!userData) throw new ResponseError(404, ERROR_MESSAGES[lang].USER_NOT_FOUND);

    checkLockout(userData.password_update_locked_until, lang);

    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${GOOGLE_API_KEY}`;
    try {
        await axios.post(verifyUrl, {
            email: userData.email,
            password: request.oldPassword,
            returnSecureToken: true
        });
    } catch (error) {
        logger.warn(`[UserPasswordService] Percobaan password lama salah untuk UID ${user.uid}`);
        throw new ResponseError(401, ERROR_MESSAGES[lang].OLD_PASSWORD_INCORRECT);
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await userRepository.update(user.uid, {
        password_update_otp: otp,
        password_update_expires: expiresAt,
        password_update_fail_count: 0,
        password_update_locked_until: null, 
        updated_at: new Date().toISOString()
    });

    try {
        await emailService.sendUpdatePasswordOtp(userData.email, userData.name, otp, lang);
    } catch (error) {
        logger.error(`[UserPasswordService] Gagal kirim OTP password ke ${userData.email}: ${error.message}`);
        throw new ResponseError(500, error.message);
    }

    return { message: SUCCESS_MESSAGES[lang].PASSWORD_OTP_SENT };
}

const validatePasswordChangeOtp = async (user, request, lang = 'id') => {
    const userData = await userRepository.findById(user.uid);
    if (!userData) throw new ResponseError(404, ERROR_MESSAGES[lang].USER_NOT_FOUND);

    checkLockout(userData.password_update_locked_until, lang);

    await validateOtpAndLockout(
        (data) => userRepository.update(user.uid, data),
        request.otp,
        userData.password_update_otp,
        userData.password_update_expires,
        userData.password_update_fail_count,
        {
            failCountField: "password_update_fail_count",
            lockedUntilField: "password_update_locked_until",
            otpField: "password_update_otp"
        },
        lang
    );

    return { message: SUCCESS_MESSAGES[lang].PASSWORD_OTP_VALID };
}

const verifyPasswordChange = async (user, request, lang = 'id') => {
    const { otp, newPassword, confirmPassword } = request;
    if (newPassword !== confirmPassword) throw new ResponseError(400, ERROR_MESSAGES[lang].PASSWORD_NOT_MATCH);

    const userData = await userRepository.findById(user.uid);
    if (!userData) throw new ResponseError(404, ERROR_MESSAGES[lang].USER_NOT_FOUND);

    checkLockout(userData.password_update_locked_until, lang);

    await validateOtpAndLockout(
        (data) => userRepository.update(user.uid, data),
        otp,
        userData.password_update_otp,
        userData.password_update_expires,
        userData.password_update_fail_count,
        {
            failCountField: "password_update_fail_count",
            lockedUntilField: "password_update_locked_until",
            otpField: "password_update_otp"
        },
        lang
    );

    try {
        await admin.auth().updateUser(user.uid, { password: newPassword });
        await admin.auth().revokeRefreshTokens(user.uid);
    } catch (error) {
        logger.error(`[UserPasswordService] Gagal update password di Auth untuk UID ${user.uid}: ${error.message}`);
        throw new ResponseError(500, `${ERROR_MESSAGES[lang].PASSWORD_UPDATE_FAILED}: ${error.message}`);
    }

    await userRepository.update(user.uid, {
        password_update_otp: null,
        password_update_expires: null,
        password_update_fail_count: 0,
        password_update_locked_until: null,
        updated_at: new Date().toISOString()
    });

    return { message: SUCCESS_MESSAGES[lang].PASSWORD_UPDATED };
}

export default { 
    requestPasswordChange, 
    validatePasswordChangeOtp, 
    verifyPasswordChange 
}