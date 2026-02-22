import userRepository from "../../repositories/user-repository.js";
import { admin } from "../../applications/firebase.js";
import { ResponseError } from "../../error/response-error.js";
import emailService from "../email/email-service.js";
import { generateOtp, checkLockout, validateOtpAndLockout } from "../../utils/security-util.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "./user-constant.js";
import { logger } from "../../applications/logging.js";

const requestEmailChange = async (user, request) => {
    const { newEmail } = request;
    const userData = await userRepository.findById(user.uid);
    if (!userData) throw new ResponseError(404, ERROR_MESSAGES.USER_NOT_FOUND);

    checkLockout(userData.email_change_locked_until);

    if (userData.email === newEmail) {
        throw new ResponseError(400, ERROR_MESSAGES.EMAIL_SAME_AS_CURRENT);
    }

    const emailExists = await userRepository.isEmailExists(newEmail);
    if (emailExists) {
        throw new ResponseError(409, ERROR_MESSAGES.EMAIL_ALREADY_USED);
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await userRepository.update(user.uid, {
        pending_email: newEmail,
        pending_email_otp: otp,
        pending_email_expires: expiresAt,
        email_change_fail_count: 0,
        email_change_locked_until: null,
        updated_at: new Date().toISOString()
    });

    try {
        await emailService.sendChangeEmailOtp(newEmail, userData.name, otp);
    } catch (error) {
        logger.error(`[UserEmailService] Gagal kirim OTP ke ${newEmail}: ${error.message}`);
        throw new ResponseError(500, error.message);
    }

    return {
        message: SUCCESS_MESSAGES.EMAIL_OTP_SENT,
        target_email: newEmail
    };
}

const verifyEmailChange = async (user, request) => {
    const userData = await userRepository.findById(user.uid);
    if (!userData) throw new ResponseError(404, ERROR_MESSAGES.USER_NOT_FOUND);

    checkLockout(userData.email_change_locked_until);

    await validateOtpAndLockout(
        (data) => userRepository.update(user.uid, data),
        request.otp,
        userData.pending_email_otp,
        userData.pending_email_expires,
        userData.email_change_fail_count,
        {
            failCountField: "email_change_fail_count",
            lockedUntilField: "email_change_locked_until",
            otpField: "pending_email_otp"
        }
    );

    const newEmail = userData.pending_email;

    try {
        await admin.auth().updateUser(user.uid, { email: newEmail });
    } catch (error) {
        logger.error(`[UserEmailService] Gagal update email di Auth untuk UID ${user.uid}: ${error.message}`);
        if (error.code === 'auth/email-already-exists') {
            throw new ResponseError(409, ERROR_MESSAGES.AUTH_EMAIL_EXISTS);
        }
        throw new ResponseError(500, ERROR_MESSAGES.AUTH_UPDATE_FAILED);
    }

    await userRepository.update(user.uid, {
        email: newEmail,
        email_verified_at: new Date().toISOString(),
        pending_email: null,
        pending_email_otp: null,
        pending_email_expires: null,
        email_change_fail_count: 0,
        email_change_locked_until: null,
        updated_at: new Date().toISOString()
    });

    return {
        message: SUCCESS_MESSAGES.EMAIL_UPDATED,
        email: newEmail
    };
}

export default { 
    requestEmailChange, 
    verifyEmailChange 
}