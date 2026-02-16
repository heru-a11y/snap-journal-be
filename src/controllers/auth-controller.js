import authService from "../services/auth-service.js";

const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const logout = async (req, res, next) => {
    try {        
        const result = await authService.logout(req.user);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const sendVerificationOtp = async (req, res, next) => {
    try {
        const result = await authService.sendVerificationOtp(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const verifyOtp = async (req, res, next) => {
    try {
        const result = await authService.verifyOtp(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const forgotPassword = async (req, res, next) => {
    try {
        const result = await authService.forgotPassword(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const verifyResetOtp = async (req, res, next) => {
    try {
        const result = await authService.verifyResetOtp(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const result = await authService.resetPassword(req.body);
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