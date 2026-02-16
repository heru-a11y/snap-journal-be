import userService from "../services/user-service.js";

const getProfile = async (req, res, next) => {
    try {
        const result = await userService.getProfile(req.user);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const updateProfile = async (req, res, next) => {
    try {
        const result = await userService.updateProfile(req.user, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const requestEmailChange = async (req, res, next) => {
    try {
        const result = await userService.requestEmailChange(req.user, req.body);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
}

const verifyEmailChange = async (req, res, next) => {
    try {
        const result = await userService.verifyEmailChange(req.user, req.body);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
}

const updateProfilePicture = async (req, res, next) => {
    try {
        const result = await userService.updateProfilePicture(req.user, req.file);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const removeProfilePicture = async (req, res, next) => {
    try {
        const result = await userService.removeProfilePicture(req.user);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const requestPasswordChange = async (req, res, next) => {
    try {
        const result = await userService.requestPasswordChange(req.user, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const validatePasswordChangeOtp = async (req, res, next) => {
    try {
        const result = await userService.validatePasswordChangeOtp(req.user, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const verifyPasswordChange = async (req, res, next) => {
    try {
        const result = await userService.verifyPasswordChange(req.user, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const requestDeleteAccount = async (req, res, next) => {
    try {
        const result = await userService.requestDeleteAccount(req.user);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const deleteAccount = async (req, res, next) => {
    try {
        const result = await userService.deleteAccount(req.user, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const setFcmToken = async (req, res, next) => {
    try {
        const result = await userService.setFcmToken(req.user, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

export default {
    getProfile,
    updateProfile,
    requestEmailChange,
    verifyEmailChange,
    updateProfilePicture,
    removeProfilePicture,
    requestPasswordChange,
    validatePasswordChangeOtp,
    verifyPasswordChange, 
    requestDeleteAccount,
    deleteAccount,
    setFcmToken
}