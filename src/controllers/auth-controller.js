import authRegistrationService from "../services/auth/auth-registration-service.js";
import authLoginService from "../services/auth/auth-login-service.js";
import authPasswordResetService from "../services/auth/auth-password-reset-service.js";

const register = async (req, res, next) => {
    try {
        const result = await authRegistrationService.register(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const login = async (req, res, next) => {
    try {
        const result = await authLoginService.login(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const logout = async (req, res, next) => {
    try {        
        const result = await authLoginService.logout(req.user);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const sendVerificationOtp = async (req, res, next) => {
    try {
        const result = await authRegistrationService.sendVerificationOtp(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const verifyOtp = async (req, res, next) => {
    try {
        const result = await authRegistrationService.verifyOtp(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const forgotPassword = async (req, res, next) => {
    try {
        const result = await authPasswordResetService.forgotPassword(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const verifyResetOtp = async (req, res, next) => {
    try {
        const result = await authPasswordResetService.verifyResetOtp(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const result = await authPasswordResetService.resetPassword(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

export default {
    register,
    login,
    logout,
    sendVerificationOtp,
    verifyOtp,
    forgotPassword,
    verifyResetOtp, 
    resetPassword
}