import userRepository from "../../repositories/user-repository.js";
import { admin } from "../../applications/firebase.js";
import { ResponseError } from "../../error/response-error.js";
import axios from "axios";
import { checkLockout, calculateLoginLockout } from "../../utils/security-util.js";
import { AUTH_ERROR_MESSAGES, AUTH_SUCCESS_MESSAGES } from "../../constants/auth-constant.js";
import { logger } from "../../applications/logging.js";

const GOOGLE_API_KEY = process.env.GOOGLE_CLIENT_API_KEY;

const login = async (request, lang = 'id') => {
    const userData = await userRepository.findByEmail(request.email);
    
    if (!userData) {
        throw new ResponseError(401, AUTH_ERROR_MESSAGES[lang].INVALID_CREDENTIALS);
    }

    const userId = userData.id;

    checkLockout(userData.login_locked_until, lang);

    if (!userData.email_verified_at) {
        throw new ResponseError(403, AUTH_ERROR_MESSAGES[lang].UNVERIFIED_ACCOUNT);
    }

    const loginUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${GOOGLE_API_KEY}`;

    try {
        const response = await axios.post(loginUrl, {
            email: request.email,
            password: request.password,
            returnSecureToken: true
        });

        const { idToken, localId, refreshToken, expiresIn } = response.data;

        await userRepository.update(localId, {
            last_entry_at: new Date().toISOString(),
            login_fail_count: 0,
            login_locked_until: null
        });

        return {
            token: idToken,
            refreshToken: refreshToken,
            expiresIn: expiresIn,
            user: {
                uid: localId,
                name: userData.name,
                email: userData.email,
                email_verified_at: userData.email_verified_at
            }
        };

    } catch (error) {
        if (error.response) {
            const errorCode = error.response.data.error.message;

            if (errorCode === "INVALID_PASSWORD" || errorCode === "INVALID_LOGIN_CREDENTIALS") {
                const { newCount, lockedUntil, isLocked, message } = calculateLoginLockout(
                    userData.login_fail_count, 
                    5, 
                    15,
                    lang
                );

                await userRepository.update(userId, {
                    login_fail_count: newCount,
                    login_locked_until: lockedUntil
                });

                if (isLocked) {
                    throw new ResponseError(429, message);
                } else {
                    throw new ResponseError(401, message);
                }

            } else if (errorCode === "EMAIL_NOT_FOUND") {
                throw new ResponseError(401, AUTH_ERROR_MESSAGES[lang].INVALID_CREDENTIALS);
            } else if (errorCode === "USER_DISABLED") {
                throw new ResponseError(403, AUTH_ERROR_MESSAGES[lang].ACCOUNT_DISABLED);
            } else if (errorCode === "TOO_MANY_ATTEMPTS_TRY_LATER") {
                throw new ResponseError(429, AUTH_ERROR_MESSAGES[lang].TOO_MANY_ATTEMPTS);
            }
        }
        
        logger.error(`[AuthLoginService] Login error untuk email ${request.email}: ${error.message}`);
        throw new ResponseError(500, AUTH_ERROR_MESSAGES[lang].LOGIN_SERVICE_ERROR);
    }
}

const logout = async (user, lang = 'id') => {
    try {
        await admin.auth().revokeRefreshTokens(user.uid);
    } catch (error) {
        logger.warn(`[AuthLoginService] Gagal revoke token saat logout untuk UID ${user.uid}: ${error.message}`);
    }
    return { message: AUTH_SUCCESS_MESSAGES[lang].LOGOUT_SUCCESS };
}

export default {
    login,
    logout
}