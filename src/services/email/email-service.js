import nodemailer from "nodemailer";
import { getHtmlTemplate } from "../../utils/email-utils.js";
import { LOG_PREFIX, EMAIL_CONFIG } from "./email-constant.js";
import { logger } from "../../applications/logging.js";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async ({ email, name, otp, config }) => {
    try {
        const html = getHtmlTemplate(config.templateFile, {
            name,
            otp,
            year: new Date().getFullYear()
        });

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
            to: email,
            subject: config.subject,
            html
        };

        await transporter.sendMail(mailOptions);
        
        logger.info(`${LOG_PREFIX} Berhasil mengirim ${config.logName}`, {
            email,
            action: config.logName
        });
    } catch (error) {
        logger.error(`${LOG_PREFIX} Gagal mengirim ${config.logName}`, {
            email,
            action: config.logName,
            error: error.message
        });
        
        throw new Error(config.errorMessage);
    }
};

const sendVerificationOtp = (email, name, otp) => sendEmail({ email, name, otp, config: EMAIL_CONFIG.VERIFICATION });
const sendResetPasswordOtp = (email, name, otp) => sendEmail({ email, name, otp, config: EMAIL_CONFIG.RESET_PASSWORD });
const sendUpdatePasswordOtp = (email, name, otp) => sendEmail({ email, name, otp, config: EMAIL_CONFIG.UPDATE_PASSWORD });
const sendChangeEmailOtp = (email, name, otp) => sendEmail({ email, name, otp, config: EMAIL_CONFIG.CHANGE_EMAIL });
const sendDeleteAccountOtp = (email, name, otp) => sendEmail({ email, name, otp, config: EMAIL_CONFIG.DELETE_ACCOUNT });

export default {
    sendVerificationOtp,
    sendChangeEmailOtp,
    sendResetPasswordOtp,
    sendUpdatePasswordOtp,
    sendDeleteAccountOtp 
};