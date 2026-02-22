import userProfileService from "../services/user/user-profile-service.js";
import userEmailService from "../services/user/user-email-service.js";
import userMediaService from "../services/user/user-media-service.js";
import userPasswordService from "../services/user/user-password-service.js";
import userAccountService from "../services/user/user-account-service.js";

const getProfile = async (req, res, next) => {
    try {
        const result = await userProfileService.getProfile(req.user);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const updateProfile = async (req, res, next) => {
    try {
        const result = await userProfileService.updateProfile(req.user, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const requestEmailChange = async (req, res, next) => {
    try {
        const result = await userEmailService.requestEmailChange(req.user, req.body);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
}

const verifyEmailChange = async (req, res, next) => {
    try {
        const result = await userEmailService.verifyEmailChange(req.user, req.body);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
}

const updateProfilePicture = async (req, res, next) => {
    try {
        const result = await userMediaService.updateProfilePicture(req.user, req.file);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const removeProfilePicture = async (req, res, next) => {
    try {
        const result = await userMediaService.removeProfilePicture(req.user);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const requestPasswordChange = async (req, res, next) => {
    try {
        const result = await userPasswordService.requestPasswordChange(req.user, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const validatePasswordChangeOtp = async (req, res, next) => {
    try {
        const result = await userPasswordService.validatePasswordChangeOtp(req.user, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const verifyPasswordChange = async (req, res, next) => {
    try {
        const result = await userPasswordService.verifyPasswordChange(req.user, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const requestDeleteAccount = async (req, res, next) => {
    try {
        const result = await userAccountService.requestDeleteAccount(req.user);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const deleteAccount = async (req, res, next) => {
    try {
        const result = await userAccountService.deleteAccount(req.user, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const setFcmToken = async (req, res, next) => {
    try {
        const result = await userProfileService.setFcmToken(req.user, req.body);
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