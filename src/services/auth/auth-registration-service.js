import userRepository from "../../repositories/user-repository.js";
import { admin } from "../../applications/firebase.js";
import { ResponseError } from "../../error/response-error.js";
import emailService from "../email-service.js";
import { generateOtp, checkCooldown, checkLockout, validateOtpAndLockout } from "../../utils/security-util.js";
import { AUTH_ERROR_MESSAGES, AUTH_SUCCESS_MESSAGES } from "./auth-constant.js";
import { logger } from "../../applications/logging.js";

const register = async (request) => {
    const userData = await userRepository.findByEmail(request.email);

    if (userData) {
        if (userData.email_verified_at) {
            throw new ResponseError(409, AUTH_ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED);
        }

        const { newCount, newTimestamp } = checkCooldown(
            userData.verification_last_sent_at, 
            userData.verification_request_count
        );

        const newOtp = generateOtp();
        const newExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        await userRepository.update(userData.id, {
            otp_code: newOtp,
            otp_expires_at: newExpiresAt,
            verification_request_count: newCount,
            verification_last_sent_at: newTimestamp,
            verification_fail_count: 0,
            verification_locked_until: null,
            updated_at: new Date().toISOString()
        });

        try {
            await emailService.sendVerificationOtp(userData.email, userData.name, newOtp);
        } catch (emailError) {
            logger.error(`[AuthRegistrationService] Gagal kirim email OTP ulang ke ${userData.email}: ${emailError.message}`);
        }

        return {
            email: userData.email,
            is_resend: true,
            message: AUTH_SUCCESS_MESSAGES.RESEND_OTP_SUCCESS
        };
    }

    let userRecord;
    try {
        userRecord = await admin.auth().createUser({
            email: request.email,
            password: request.password,
            displayName: request.name
        });
    } catch (error) {
        throw new ResponseError(400, `${AUTH_ERROR_MESSAGES.AUTH_REGISTER_FAILED}: ${error.message}`);
    }

    const now = new Date().toISOString();
    const otpCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const newUserData = {
        uid: userRecord.uid,
        name: request.name,
        email: request.email,
        password: "encrypted_by_firebase",
        photoUrl: null,
        email_verified_at: null,
        otp_code: otpCode,
        otp_expires_at: otpExpiresAt,
        verification_request_count: 1,
        verification_last_sent_at: now,
        verification_fail_count: 0,
        verification_locked_until: null,
        fcm_token: null,
        last_entry_at: null,
        created_at: now,
        updated_at: now
    };

    try {
        await userRepository.create(userRecord.uid, newUserData);
    } catch (error) {
        await admin.auth().deleteUser(userRecord.uid);
        throw new ResponseError(500, `${AUTH_ERROR_MESSAGES.DB_SAVE_FAILED}: ${error.message}`);
    }

    try {
        await emailService.sendVerificationOtp(request.email, request.name, otpCode);
    } catch (emailError) {
        logger.error(`[AuthRegistrationService] Gagal kirim email registrasi ke ${request.email}: ${emailError.message}`);
    }

    return {
        email: newUserData.email,
        is_resend: false,
        message: AUTH_SUCCESS_MESSAGES.REGISTER_SUCCESS
    };
}

const verifyOtp = async (request) => {
    const { email, otp } = request;
    if (!email || !otp) throw new ResponseError(400, AUTH_ERROR_MESSAGES.EMAIL_OTP_REQUIRED);

    const userData = await userRepository.findByEmail(email);
    if (!userData) throw new ResponseError(404, AUTH_ERROR_MESSAGES.EMAIL_NOT_REGISTERED);

    const userId = userData.id;

    checkLockout(userData.verification_locked_until);

    if (userData.email_verified_at) {
        return { message: AUTH_SUCCESS_MESSAGES.VERIFY_ALREADY_DONE };
    }

    await validateOtpAndLockout(
        (data) => userRepository.update(userId, data),
        otp,
        userData.otp_code,
        userData.otp_expires_at,
        userData.verification_fail_count,
        {
            failCountField: "verification_fail_count",
            lockedUntilField: "verification_locked_until",
            otpField: "otp_code"
        }
    );

    const verifyTime = new Date().toISOString();
    
    await userRepository.update(userId, { 
        email_verified_at: verifyTime,
        otp_code: null,
        otp_expires_at: null,
        verification_fail_count: 0,
        verification_locked_until: null,
        updated_at: verifyTime
    });

    try { 
        await admin.auth().updateUser(userId, { emailVerified: true }); 
    } catch (error) {
        logger.error(`[AuthRegistrationService] Gagal set emailVerified di Auth untuk UID ${userId}: ${error.message}`);
    }

    return { 
        message: AUTH_SUCCESS_MESSAGES.VERIFY_SUCCESS,
        email: email
    };
}

const sendVerificationOtp = async (request) => {
    const { email } = request;
    if (!email) throw new ResponseError(400, AUTH_ERROR_MESSAGES.EMAIL_REQUIRED);

    const userData = await userRepository.findByEmail(email);
    
    if (!userData) {
        return {
            message: `Kode OTP baru dikirim ke email ${email}.`,
            expires_in: "5 minutes"
        }
    }

    if (userData.email_verified_at) {
        throw new ResponseError(409, AUTH_ERROR_MESSAGES.ALREADY_VERIFIED);
    }

    const { newCount, newTimestamp } = checkCooldown(
        userData.verification_last_sent_at, 
        userData.verification_request_count
    );

    const newOtp = generateOtp();
    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();

    await userRepository.update(userData.id, {
        otp_code: newOtp,
        otp_expires_at: newExpiresAt,
        verification_request_count: newCount,
        verification_last_sent_at: newTimestamp,
        verification_fail_count: 0,
        verification_locked_until: null,
        updated_at: now.toISOString()
    });

    try {
        await emailService.sendVerificationOtp(userData.email, userData.name, newOtp);
    } catch (error) {
        logger.error(`[AuthRegistrationService] Gagal kirim ulang OTP ke ${userData.email}: ${error.message}`);
    }

    return {
        message: `Kode OTP baru dikirim ke email ${email}.`,
        expires_in: "5 minutes"
    };
}

export default {
    register,
    verifyOtp,
    sendVerificationOtp
}