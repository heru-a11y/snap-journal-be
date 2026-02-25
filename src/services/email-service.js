import nodemailer from "nodemailer";
import { getHtmlTemplate } from "../utils/email-utils.js";
import { LOG_PREFIX, EMAIL_CONFIG } from "../constants/email-constant.js";
import { logger } from "../applications/logging.js";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async ({ email, name, otp, config, lang = 'id' }) => {
    try {
        // Pilih konfigurasi berdasarkan bahasa (id atau en)
        // Fallback ke 'id' jika konfigurasi bahasa tidak ditemukan
        const localizedConfig = config[lang] || config['id'];

        const html = getHtmlTemplate(localizedConfig.templateFile, {
            name,
            otp,
            year: new Date().getFullYear()
        });

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
            to: email,
            subject: localizedConfig.subject,
            html
        };

        await transporter.sendMail(mailOptions);
        
        logger.info(`${LOG_PREFIX} Berhasil mengirim ${config.logName} (${lang})`, {
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

// Update fungsi wrapper untuk menerima parameter lang
const sendVerificationOtp = (email, name, otp, lang = 'id') => 
    sendEmail({ email, name, otp, config: EMAIL_CONFIG.VERIFICATION, lang });

const sendResetPasswordOtp = (email, name, otp, lang = 'id') => 
    sendEmail({ email, name, otp, config: EMAIL_CONFIG.RESET_PASSWORD, lang });

const sendUpdatePasswordOtp = (email, name, otp, lang = 'id') => 
    sendEmail({ email, name, otp, config: EMAIL_CONFIG.UPDATE_PASSWORD, lang });

const sendChangeEmailOtp = (email, name, otp, lang = 'id') => 
    sendEmail({ email, name, otp, config: EMAIL_CONFIG.CHANGE_EMAIL, lang });

const sendDeleteAccountOtp = (email, name, otp, lang = 'id') => 
    sendEmail({ email, name, otp, config: EMAIL_CONFIG.DELETE_ACCOUNT, lang });

export default {
    sendVerificationOtp,
    sendChangeEmailOtp,
    sendResetPasswordOtp,
    sendUpdatePasswordOtp,
    sendDeleteAccountOtp 
};