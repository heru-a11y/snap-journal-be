import { ResponseError } from "../error/response-error.js";

/**
 * 1. GENERATOR OTP
 * Menghasilkan string angka 4 digit acak.
 */
export const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * 2. VALIDASI LOCKOUT (KUNCI SEMENTARA)
 * Digunakan saat user SALAH memasukkan password/OTP berkali-kali.
 * * @param {string|null} lockedUntilStr - String ISO Date dari database (misal: user.locked_until)
 * @throws {ResponseError} 429 jika waktu kunci belum habis
 */
export const checkLockout = (lockedUntilStr) => {
    if (lockedUntilStr) {
        const lockedUntil = new Date(lockedUntilStr);
        const now = new Date();
        
        if (now < lockedUntil) {
            const timeLeft = Math.ceil((lockedUntil - now) / 60000);
            throw new ResponseError(429, `Terlalu banyak percobaan gagal. Akun dikunci sementara. Silakan coba lagi dalam ${timeLeft} menit.`);
        }
    }
};

/**
 * 3. VALIDASI COOLDOWN (JEDA REQUEST)
 * Digunakan untuk membatasi Spam (misal: tombol Resend OTP maksimal 3x per jam).
 * * @param {string|null} lastAttemptStr - Waktu terakhir request dilakukan
 * @param {number} currentCount - Jumlah percobaan saat ini
 * @param {number} maxAttempts - Maksimal percobaan (default: 3)
 * @param {number} cooldownMs - Durasi cooldown dalam ms (default: 1 jam)
 * @returns {Object} { newCount, newTimestamp } untuk disimpan ke DB
 */
export const checkCooldown = (lastAttemptStr, currentCount, maxAttempts = 3, cooldownMs = 3600000) => {
    const now = new Date();
    const lastAttempt = lastAttemptStr ? new Date(lastAttemptStr) : new Date(0);
    const timeDiff = now - lastAttempt;

    let newCount = currentCount || 0;

    if (timeDiff > cooldownMs) {
        newCount = 0;
    }

    if (newCount >= maxAttempts) {
        const resetInMinutes = Math.ceil((cooldownMs - timeDiff) / 60000);
        const waitTime = resetInMinutes > 0 ? resetInMinutes : 60; 
        
        throw new ResponseError(429, `Batas permintaan tercapai (${maxAttempts}x). Silakan tunggu ${waitTime} menit sebelum meminta kode baru.`);
    }

    return {
        newCount: newCount + 1,
        newTimestamp: now.toISOString()
    };
};

/**
 * 4. HITUNG LOGIC LOGIN GAGAL
 * Menghitung counter gagal dan menentukan apakah harus dikunci.
 * * @param {number} currentFailCount - Jumlah gagal saat ini dari DB
 * @param {number} maxAttempts - Batas maksimal gagal (default: 5)
 * @param {number} lockDurationMinutes - Durasi kunci (default: 15 menit)
 */
export const calculateLoginLockout = (currentFailCount, maxAttempts = 5, lockDurationMinutes = 15) => {
    const newCount = (currentFailCount || 0) + 1;
    let lockedUntil = null;
    let isLocked = false;
    let message = "";

    if (newCount >= maxAttempts) {
        const now = new Date();
        lockedUntil = new Date(now.getTime() + lockDurationMinutes * 60000).toISOString();
        isLocked = true;
        message = `Anda telah salah memasukkan password ${newCount} kali. Akun dikunci selama ${lockDurationMinutes} menit.`;
    } else {
        const remaining = maxAttempts - newCount;
        message = `Password salah. Sisa percobaan: ${remaining} kali.`;
    }

    return {
        newCount,
        lockedUntil,
        isLocked,
        message
    };
};