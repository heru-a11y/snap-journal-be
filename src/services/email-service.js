import nodemailer from "nodemailer";
import { getHtmlTemplate } from "../utils/email-utils.js";

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
 * Mengirim Email Verifikasi berisi Kode OTP saat Registrasi.
 */
const sendVerificationOtp = async (email, name, otp) => {
    try {
        const html = getHtmlTemplate("verification-email.html", {
            name: name,
            otp: otp,
            year: new Date().getFullYear()
        });

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Kode Verifikasi (OTP) - Snap Journal",
            html: html
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Verification OTP sent to ${email}`);
    } catch (error) {
        console.error("[Email Service] SMTP Error (Verification OTP):", error);
    }
};

/**
 * Mengirim Email OTP untuk Reset Password (Lupa Password).
 */
const sendResetPasswordOtp = async (email, name, otp) => {
    try {
        const html = getHtmlTemplate("reset-password.html", {
            name: name,
            otp: otp,
            year: new Date().getFullYear()
        });

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Permintaan Reset Password - Snap Journal",
            html: html
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Reset Password OTP sent to ${email}`);
    } catch (error) {
        console.error("[Email Service] SMTP Error (Reset Password OTP):", error);
        throw new Error("Gagal mengirim email reset password.");
    }
};

/**
 * Mengirim Email OTP untuk Perubahan Password (Saat Sedang Login).
 */
const sendUpdatePasswordOtp = async (email, name, otp) => {
    try {
        const html = getHtmlTemplate("update-password.html", {
            name: name,
            otp: otp,
            year: new Date().getFullYear()
        });

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Keamanan Akun: Kode Verifikasi Ganti Password - Snap Journal",
            html: html
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Update Password OTP sent to ${email}`);
    } catch (error) {
        console.error("[Email Service] SMTP Error (Update Password OTP):", error);
        throw new Error("Gagal mengirim email OTP ganti password.");
    }
};

/**
 * Mengirim Email OTP untuk Perubahan Email.
 */
const sendChangeEmailOtp = async (email, name, otp) => {
    try {
        const html = getHtmlTemplate("change-email.html", {
            name: name,
            otp: otp,
            year: new Date().getFullYear()
        });

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Konfirmasi Perubahan Email - Snap Journal",
            html: html
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Change Email OTP sent to ${email}`);
    } catch (error) {
        console.error("[Email Service] SMTP Error (Change Email):", error);
        throw new Error("Gagal mengirim email OTP.");
    }
};

/**
 * Mengirim Email OTP untuk Penghapusan Akun.
 */
const sendDeleteAccountOtp = async (email, name, otp) => {
    try {
        const html = getHtmlTemplate("delete-account.html", {
            name: name,
            otp: otp,
            year: new Date().getFullYear()
        });

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "PENTING: Kode Konfirmasi Penghapusan Akun - Snap Journal",
            html: html
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Delete Account OTP sent to ${email}`);
    } catch (error) {
        console.error("[Email Service] SMTP Error (Delete Account):", error);
        throw new Error("Gagal mengirim email OTP hapus akun.");
    }
};

export default {
    sendVerificationOtp,
    sendChangeEmailOtp,
    sendResetPasswordOtp,
    sendUpdatePasswordOtp,
    sendDeleteAccountOtp 
};