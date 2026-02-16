import express from "express";
import userController from "../controllers/user-controller.js";
import { 
    updateUserValidation, 
    requestEmailChangeValidation,
    verifyEmailChangeValidation, 
    requestPasswordChangeValidation,
    validatePasswordChangeOtpValidation,
    verifyPasswordChangeValidation,
    deleteAccountValidation,
    fcmTokenValidation
} from "../validations/user-validation.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { runValidation } from "../middlewares/validation-middleware.js";
import { multipartMiddleware } from "../middlewares/multipart-middleware.js";

const userRouter = new express.Router();

userRouter.use(authMiddleware);

userRouter.get(
    '/api/v1/user/profile', 
    userController.getProfile
);

userRouter.put(
    '/api/v1/user/profile', 
    runValidation(updateUserValidation), 
    userController.updateProfile
);

userRouter.patch(
    '/api/v1/user/profile/picture', 
    multipartMiddleware, 
    userController.updateProfilePicture
);

userRouter.delete(
    '/api/v1/user/profile/picture', 
    userController.removeProfilePicture
);

userRouter.post(
    '/api/v1/user/email/change-request', 
    runValidation(requestEmailChangeValidation), 
    userController.requestEmailChange
);

userRouter.post(
    '/api/v1/user/email/change-verify', 
    runValidation(verifyEmailChangeValidation), 
    userController.verifyEmailChange
);

userRouter.post(
    '/api/v1/user/password/change-request', 
    runValidation(requestPasswordChangeValidation), 
    userController.requestPasswordChange
);

userRouter.post(
    '/api/v1/user/password/change-validate', 
    runValidation(validatePasswordChangeOtpValidation), 
    userController.validatePasswordChangeOtp
);

userRouter.post(
    '/api/v1/user/password/change-verify', 
    runValidation(verifyPasswordChangeValidation), 
    userController.verifyPasswordChange
);

userRouter.post(
    '/api/v1/user/delete-request',
    userController.requestDeleteAccount
);

userRouter.delete(
    '/api/v1/user/delete', 
    runValidation(deleteAccountValidation),
    userController.deleteAccount
);

userRouter.post(
    '/api/v1/fcm/token', 
    runValidation(fcmTokenValidation), 
    userController.setFcmToken
);

export { userRouter };