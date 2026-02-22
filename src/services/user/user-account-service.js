import userRepository from "../../repositories/user-repository.js";
import { admin } from "../../applications/firebase.js";
import { ResponseError } from "../../error/response-error.js";
import emailService from "../email/email-service.js";
import { generateOtp, checkLockout, validateOtpAndLockout } from "../../utils/security-util.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "./user-constant.js";
import { logger } from "../../applications/logging.js";

const requestDeleteAccount = async (user) => {
    const userData = await userRepository.findById(user.uid);
    if (!userData) throw new ResponseError(404, ERROR_MESSAGES.USER_NOT_FOUND);

    checkLockout(userData.delete_account_locked_until);

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await userRepository.update(user.uid, {
        delete_account_otp: otp,
        delete_account_expires: expiresAt,
        delete_account_fail_count: 0,
        delete_account_locked_until: null,
        updated_at: new Date().toISOString()
    });

    try {
        await emailService.sendDeleteAccountOtp(userData.email, userData.name, otp);
    } catch (error) {
        logger.error(`[UserAccountService] Gagal kirim OTP hapus akun ke ${userData.email}: ${error.message}`);
        throw new ResponseError(500, error.message);
    }

    return {
        message: SUCCESS_MESSAGES.DELETE_OTP_SENT
    };
}

const deleteAccount = async (user, request) => {
    const userData = await userRepository.findById(user.uid);
    if (!userData) throw new ResponseError(404, ERROR_MESSAGES.USER_NOT_FOUND);

    checkLockout(userData.delete_account_locked_until);

    await validateOtpAndLockout(
        (data) => userRepository.update(user.uid, data),
        request.otp, 
        userData.delete_account_otp, 
        userData.delete_account_expires, 
        userData.delete_account_fail_count, 
        {
            failCountField: "delete_account_fail_count",
            lockedUntilField: "delete_account_locked_until",
            otpField: "delete_account_otp"
        }
    );

    try {
        await admin.auth().deleteUser(user.uid);
        await userRepository.deleteById(user.uid);
        
        logger.info(`[UserAccountService] Akun dengan UID ${user.uid} telah dihapus permanen.`);
        return { message: SUCCESS_MESSAGES.ACCOUNT_DELETED };
    } catch (error) {
        logger.error(`[UserAccountService] Kegagalan kritis saat menghapus akun UID ${user.uid}: ${error.message}`);
        throw new ResponseError(500, `${ERROR_MESSAGES.ACCOUNT_DELETE_FAILED}: ${error.message}`);
    }
}

export default { 
    requestDeleteAccount, 
    deleteAccount 
}