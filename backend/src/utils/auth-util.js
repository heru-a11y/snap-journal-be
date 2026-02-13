import jwt from "jsonwebtoken";
import { database } from "../applications/database.js"; 
import emailService from "../services/email-service.js";
import { ResponseError } from "../error/response-error.js";

const JWT_SECRET = process.env.JWT_SECRET;

// --- KONFIGURASI LIMIT ---
const MAX_ATTEMPTS = 3;
const COOLDOWN_WINDOW = 60 * 60 * 1000; // 1 Jam

/**
 * Helper: Cek Limit Request
 * Mengembalikan object update jika lolos, atau throw error jika limit habis
 */
export const checkRateLimit = (lastResetAt, currentCount, typeLabel) => {
    const now = new Date();
    const lastReset = lastResetAt ? new Date(lastResetAt) : new Date(0);
    const timeDiff = now - lastReset;

    let newCount = currentCount || 0;
    let newResetAt = lastResetAt;

    if (timeDiff > COOLDOWN_WINDOW) {
        newCount = 0;
        newResetAt = now.toISOString();
    }

    if (newCount >= MAX_ATTEMPTS) {
        throw new ResponseError(429, `Batas permintaan ${typeLabel} tercapai (Maksimal 3 kali). Silakan coba lagi dalam 1 jam.`);
    }

    return {
        count: newCount + 1,
        resetAt: newResetAt || now.toISOString()
    };
};

/**
 * Helper: Proses Token & Kirim Email Verifikasi
 */
export const processVerificationEmail = async (uid, email, name) => {
    const token = jwt.sign(
        { uid: uid, email: email }, 
        JWT_SECRET, 
        { expiresIn: '5m' }
    );

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"; 
    const verificationLink = `${FRONTEND_URL}/email/verify?token=${token}`;

    await emailService.sendVerificationEmail(email, name, verificationLink);

    await database.collection("users").doc(uid).update({
        last_verification_sent_at: new Date().toISOString()
    });
};