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

/**
 * [TESTING ONLY] Endpoint untuk memicu Reminder AI secara manual
 * Akses: GET /api/v1/test/reminder-job
 */
publicRouter.get('/api/v1/test/reminder-job', async (req, res) => {
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
    "/api/v1/auth/register",
    runValidation(registerUserValidation),
    authController.register
);

publicRouter.post(
    "/api/v1/auth/login",
    runValidation(loginUserValidation),
    authController.login
);

publicRouter.post(
    '/api/v1/auth/email/verify', 
    runValidation(verifyOtpValidation), 
    authController.verifyOtp
);

publicRouter.post(
    '/api/v1/auth/email/send-otp', 
    runValidation(sendOtpValidation), 
    authController.sendVerificationOtp
);

publicRouter.post(
    '/api/v1/auth/forgot-password', 
    runValidation(forgotPasswordValidation), 
    authController.forgotPassword
);

publicRouter.post(
    '/api/v1/auth/forgot-password/verify', 
    runValidation(verifyResetOtpValidation), 
    authController.verifyResetOtp
);

publicRouter.post(
    '/api/v1/auth/reset-password', 
    runValidation(resetPasswordValidation), 
    authController.resetPassword
);

export { publicRouter };