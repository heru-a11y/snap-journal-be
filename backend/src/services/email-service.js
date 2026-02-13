import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Helper untuk membaca template HTML dan mengganti variabel
 * @param {string} templateName - Nama file template (misal: verification.html)
 * @param {object} data - Object berisi data untuk direplace (key: value)
 */
const getHtmlTemplate = (templateName, data) => {
    const templatePath = path.join(__dirname, "../templates/emails", templateName);
    
    let htmlContent = fs.readFileSync(templatePath, "utf8");
    
    Object.keys(data).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        htmlContent = htmlContent.replace(regex, data[key]);
    });

    return htmlContent;
};

/**
 * Mengirim Email Verifikasi Akun menggunakan template HTML.
 * Fungsi ini akan membaca file 'verification.html' dan mengganti placeholder data.
 * * @param {string} email - Alamat email penerima
 * @param {string} name - Nama user (untuk sapaan di dalam email)
 * @param {string} verificationLink - URL lengkap verifikasi (Frontend URL + Token)
 * @returns {Promise<void>}
 */
const sendVerificationEmail = async (email, name, verificationLink) => {
    try {
        const html = getHtmlTemplate("verification.html", {
            name: name,
            link: verificationLink,
            year: new Date().getFullYear()
        });

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Verifikasi Email Akun Snap Journal",
            html: html
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Verification email sent to ${email}`);
    } catch (error) {
        console.error("[Email Service] SMTP Error (Verification):", error);
    }
};

/**
 * Mengirim Email Reset Password menggunakan template HTML.
 * Fungsi ini akan membaca file 'reset-password.html' dan mengganti placeholder link.
 * * @param {string} email - Alamat email penerima
 * @param {string} resetLink - URL lengkap reset password (Frontend URL + Token)
 * @returns {Promise<void>}
 */
const sendResetPasswordEmail = async (email, resetLink) => {
    try {
        const html = getHtmlTemplate("reset-password.html", {
            link: resetLink,
            year: new Date().getFullYear()
        });

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Reset Password - Snap Journal",
            html: html
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Reset password email sent to ${email}`);
    } catch (error) {
        console.error("[Email Service] SMTP Error (Reset Password):", error);
        throw new Error("Gagal mengirim email reset password (SMTP Error).");
    }
};

export default {
    sendVerificationEmail,
    sendResetPasswordEmail
};