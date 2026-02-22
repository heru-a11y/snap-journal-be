import express from "express";
import authController from "../controllers/auth-controller.js";
import { runValidation } from "../middlewares/validation-middleware.js";
import { 
    registerUserValidation, 
    loginUserValidation, 
    forgotPasswordValidation, 
    resetPasswordValidation,
    verifyOtpValidation, 
    sendOtpValidation,
    verifyResetOtpValidation
} from "../validations/auth-validation.js"; 
import { checkInactiveUsers } from "../jobs/checkInactiveUsers.js";

const publicRouter = new express.Router();

publicRouter.get('/test/reminder-job', async (req, res) => {
    try {
        await checkInactiveUsers();
        res.status(200).json({ 
            message: "Job manual berhasil dijalankan. Silakan periksa log terminal backend untuk melihat proses AI dan pengiriman FCM." 
        });
    } catch (error) {
        res.status(500).json({ 
            error: "Gagal menjalankan job manual", 
            details: error.message 
        });
    }
});

publicRouter.post(
    "/auth/register",
    runValidation(registerUserValidation),
    authController.register
);

publicRouter.post(
    "/auth/login",
    runValidation(loginUserValidation),
    authController.login
);

publicRouter.post(
    '/auth/email/verify', 
    runValidation(verifyOtpValidation), 
    authController.verifyOtp
);

publicRouter.post(
    '/auth/email/send-otp', 
    runValidation(sendOtpValidation), 
    authController.sendVerificationOtp
);

publicRouter.post(
    '/auth/forgot-password', 
    runValidation(forgotPasswordValidation), 
    authController.forgotPassword
);

publicRouter.post(
    '/auth/forgot-password/verify', 
    runValidation(verifyResetOtpValidation), 
    authController.verifyResetOtp
);

publicRouter.post(
    '/auth/reset-password', 
    runValidation(resetPasswordValidation), 
    authController.resetPassword
);

export { publicRouter };