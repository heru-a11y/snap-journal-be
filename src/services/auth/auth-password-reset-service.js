import userRepository from "../../repositories/user-repository.js";
import { admin } from "../../applications/firebase.js";
import { ResponseError } from "../../error/response-error.js";
import emailService from "../email-service.js";
import { generateOtp, checkCooldown, checkLockout, validateOtpAndLockout } from "../../utils/security-util.js";
import { AUTH_ERROR_MESSAGES, AUTH_SUCCESS_MESSAGES } from "../../constants/auth-constant.js";
import { logger } from "../../applications/logging.js";

const forgotPassword = async (request, lang = 'id') => {
    const { email } = request;
    if (!email) throw new ResponseError(400, AUTH_ERROR_MESSAGES[lang].EMAIL_REQUIRED);

    const userData = await userRepository.findByEmail(email);

    if (!userData) {
        return { message: AUTH_SUCCESS_MESSAGES[lang].RESET_OTP_SENT_GENERIC };
    }

    const { newCount, newTimestamp } = checkCooldown(
        userData.password_reset_last_sent_at, 
        userData.password_reset_request_count,
        3, 3600000, lang
    );

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); 

    await userRepository.update(userData.id, {
        password_reset_otp: otpCode,
        password_reset_expires: expiresAt,
        password_reset_request_count: newCount,
        password_reset_last_sent_at: newTimestamp,
        password_reset_fail_count: 0,
        password_reset_locked_until: null,
        updated_at: new Date().toISOString()
    });

    try {
        await emailService.sendResetPasswordOtp(email, userData.name, otpCode, lang);
    } catch (error) {
        logger.error(`[AuthPasswordResetService] Gagal kirim email reset password ke ${email}: ${error.message}`);
    }

    return { message: AUTH_SUCCESS_MESSAGES[lang].RESET_OTP_SENT };
}

const verifyResetOtp = async (request, lang = 'id') => {
    const { email, otp } = request;
    if (!email || !otp) throw new ResponseError(400, AUTH_ERROR_MESSAGES[lang].EMAIL_OTP_REQUIRED);

    const userData = await userRepository.findByEmail(email);
    if (!userData) throw new ResponseError(404, AUTH_ERROR_MESSAGES[lang].USER_NOT_FOUND);

    checkLockout(userData.password_reset_locked_until, lang);
    
    await validateOtpAndLockout(
        (data) => userRepository.update(userData.id, data),
        otp,
        userData.password_reset_otp,
        userData.password_reset_expires,
        userData.password_reset_fail_count,
        {
            failCountField: "password_reset_fail_count",
            lockedUntilField: "password_reset_locked_until",
            otpField: "password_reset_otp"
        },
        lang
    );

    return { 
        message: AUTH_SUCCESS_MESSAGES[lang].RESET_OTP_VALID,
        email: email,
        otp: otp 
    };
}

const resetPassword = async (request, lang = 'id') => {
    const { email, otp, password, password_confirmation } = request;

    if (password !== password_confirmation) throw new ResponseError(400, AUTH_ERROR_MESSAGES[lang].PASSWORD_NOT_MATCH);

    const userData = await userRepository.findByEmail(email);
    if (!userData) throw new ResponseError(404, AUTH_ERROR_MESSAGES[lang].USER_NOT_FOUND);

    const userId = userData.id;

    checkLockout(userData.password_reset_locked_until, lang);

    await validateOtpAndLockout(
        (data) => userRepository.update(userId, data),
        otp,
        userData.password_reset_otp,
        userData.password_reset_expires,
        userData.password_reset_fail_count,
        {
            failCountField: "password_reset_fail_count",
            lockedUntilField: "password_reset_locked_until",
            otpField: "password_reset_otp"
        },
        lang
    );

    try {
        await admin.auth().updateUser(userId, { password: password });
        await admin.auth().revokeRefreshTokens(userId);
        await userRepository.update(userId, {
            password_reset_otp: null,
            password_reset_expires: null,
            password_reset_request_count: 0,
            password_reset_fail_count: 0,  
            password_reset_locked_until: null,
            updated_at: new Date().toISOString()
        });

    } catch (error) {
        logger.error(`[AuthPasswordResetService] Gagal update password untuk UID ${userId}: ${error.message}`);
        throw new ResponseError(500, `${AUTH_ERROR_MESSAGES[lang].PASSWORD_UPDATE_FAILED}: ${error.message}`);
    }

    return { message: AUTH_SUCCESS_MESSAGES[lang].PASSWORD_RESET_SUCCESS };
};

export default {
    forgotPassword,
    verifyResetOtp,
    resetPassword
}