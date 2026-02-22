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
    '/user/profile', 
    userController.getProfile
);

userRouter.put(
    '/user/profile', 
    runValidation(updateUserValidation), 
    userController.updateProfile
);

userRouter.patch(
    '/user/profile/picture', 
    multipartMiddleware, 
    userController.updateProfilePicture
);

userRouter.delete(
    '/user/profile/picture', 
    userController.removeProfilePicture
);

userRouter.post(
    '/user/email/change-request', 
    runValidation(requestEmailChangeValidation), 
    userController.requestEmailChange
);

userRouter.post(
    '/user/email/change-verify', 
    runValidation(verifyEmailChangeValidation), 
    userController.verifyEmailChange
);

userRouter.post(
    '/user/password/change-request', 
    runValidation(requestPasswordChangeValidation), 
    userController.requestPasswordChange
);

userRouter.post(
    '/user/password/change-validate', 
    runValidation(validatePasswordChangeOtpValidation), 
    userController.validatePasswordChangeOtp
);

userRouter.post(
    '/user/password/change-verify', 
    runValidation(verifyPasswordChangeValidation), 
    userController.verifyPasswordChange
);

userRouter.post(
    '/user/delete-request',
    userController.requestDeleteAccount
);

userRouter.delete(
    '/user/delete', 
    runValidation(deleteAccountValidation),
    userController.deleteAccount
);

userRouter.post(
    '/fcm/token', 
    runValidation(fcmTokenValidation), 
    userController.setFcmToken
);

export { userRouter };