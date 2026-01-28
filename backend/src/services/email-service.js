import nodemailer from "nodemailer";

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
 * Mengirim Email Verifikasi Akun
 * @param {string} email - Email penerima
 * @param {string} name - Nama user
 * @param {string} verificationLink - URL lengkap verifikasi
 */
const sendVerificationEmail = async (email, name, verificationLink) => {
    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verifikasi Email Akun Snap Journal",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333;">Halo, ${name}!</h2>
                <p>Terima kasih telah mendaftar di Snap Journal. Untuk mengaktifkan akun Anda, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verifikasi Email Saya</a>
                </div>
                <p style="color: #666; font-size: 14px;">Tautan ini hanya berlaku selama 1 jam.</p>
                <p style="color: #666; font-size: 14px;">Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2026 Snap Journal Team</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Verification email sent to ${email}`);
    } catch (error) {
        console.error("[Email Service] SMTP Error (Verification):", error);
    }
};

/**
 * Mengirim Email Reset Password
 * @param {string} email - Email penerima
 * @param {string} resetLink - URL lengkap reset password
 */
const sendResetPasswordEmail = async (email, resetLink) => {
    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Reset Password - Snap Journal",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h3 style="color: #333;">Permintaan Reset Password</h3>
                <p>Seseorang meminta untuk mereset password akun Snap Journal Anda.</p>
                <p>Silakan klik tombol di bawah ini untuk membuat password baru:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
                <p style="color: #666; font-size: 14px;">Link ini berlaku selama 60 menit.</p>
                <p style="color: #666; font-size: 14px;">Jika ini bukan Anda, abaikan email ini.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2026 Snap Journal Team</p>
            </div>
        `
    };

    try {
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