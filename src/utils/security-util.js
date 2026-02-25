import { ResponseError } from "../error/response-error.js";

export const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

export const checkLockout = (lockedUntilStr, lang = 'id') => {
    if (lockedUntilStr) {
        const lockedUntil = new Date(lockedUntilStr);
        const now = new Date();
        
        if (now < lockedUntil) {
            const timeLeft = Math.ceil((lockedUntil - now) / 60000);
            const msg = lang === 'en' 
                ? `Too many failed attempts. Account is temporarily locked. Please try again in ${timeLeft} minutes.`
                : `Terlalu banyak percobaan gagal. Akun dikunci sementara. Silakan coba lagi dalam ${timeLeft} menit.`;
            throw new ResponseError(429, msg);
        }
    }
};

export const checkCooldown = (lastAttemptStr, currentCount, maxAttempts = 3, cooldownMs = 3600000, lang = 'id') => {
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
        
        const msg = lang === 'en'
            ? `Request limit reached (${maxAttempts}x). Please wait ${waitTime} minutes before requesting a new code.`
            : `Batas permintaan tercapai (${maxAttempts}x). Silakan tunggu ${waitTime} menit sebelum meminta kode baru.`;
        throw new ResponseError(429, msg);
    }

    return {
        newCount: newCount + 1,
        newTimestamp: now.toISOString()
    };
};

export const calculateLoginLockout = (currentFailCount, maxAttempts = 5, lockDurationMinutes = 15, lang = 'id') => {
    const newCount = (currentFailCount || 0) + 1;
    let lockedUntil = null;
    let isLocked = false;
    let message = "";

    if (newCount >= maxAttempts) {
        const now = new Date();
        lockedUntil = new Date(now.getTime() + lockDurationMinutes * 60000).toISOString();
        isLocked = true;
        message = lang === 'en'
            ? `You have entered the wrong password ${newCount} times. Account locked for ${lockDurationMinutes} minutes.`
            : `Anda telah salah memasukkan password ${newCount} kali. Akun dikunci selama ${lockDurationMinutes} menit.`;
    } else {
        const remaining = maxAttempts - newCount;
        message = lang === 'en'
            ? `Incorrect password. Remaining attempts: ${remaining}.`
            : `Password salah. Sisa percobaan: ${remaining} kali.`;
    }

    return {
        newCount,
        lockedUntil,
        isLocked,
        message
    };
};

export const validateOtpAndLockout = async (updateCallback, requestOtp, dbOtp, expiresAtStr, currentFailCount, fields, lang = 'id') => {
    if (!dbOtp) {
        const msg = lang === 'en' ? "No active OTP request." : "Tidak ada permintaan OTP yang aktif.";
        throw new ResponseError(400, msg);
    }

    if (dbOtp !== requestOtp) {
        const failCount = (currentFailCount || 0) + 1;
        let updateData = { [fields.failCountField]: failCount };

        if (failCount >= 3) {
            updateData[fields.lockedUntilField] = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            updateData[fields.otpField] = null;
            await updateCallback(updateData);
            const msg = lang === 'en' 
                ? "You entered the wrong OTP 3 times. Feature temporarily locked for 1 hour." 
                : "Anda salah memasukkan OTP 3 kali. Fitur dikunci sementara selama 1 jam.";
            throw new ResponseError(429, msg);
        }

        await updateCallback(updateData);
        const msg = lang === 'en'
            ? `Incorrect OTP code. Remaining attempts: ${3 - failCount}`
            : `Kode OTP salah. Sisa percobaan: ${3 - failCount}`;
        throw new ResponseError(400, msg);
    }

    if (new Date() > new Date(expiresAtStr)) {
        const msg = lang === 'en' ? "OTP code has expired." : "Kode OTP sudah kadaluarsa.";
        throw new ResponseError(400, msg);
    }
};