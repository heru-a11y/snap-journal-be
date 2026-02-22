import { ResponseError } from "../error/response-error.js";

export const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

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

export const validateOtpAndLockout = async (updateCallback, requestOtp, dbOtp, expiresAtStr, currentFailCount, fields) => {
    if (!dbOtp) {
        throw new ResponseError(400, "Tidak ada permintaan OTP yang aktif.");
    }

    if (dbOtp !== requestOtp) {
        const failCount = (currentFailCount || 0) + 1;
        let updateData = { [fields.failCountField]: failCount };

        if (failCount >= 3) {
            updateData[fields.lockedUntilField] = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            updateData[fields.otpField] = null;
            await updateCallback(updateData);
            throw new ResponseError(429, "Anda salah memasukkan OTP 3 kali. Fitur dikunci sementara selama 1 jam.");
        }

        await updateCallback(updateData);
        throw new ResponseError(400, `Kode OTP salah. Sisa percobaan: ${3 - failCount}`);
    }

    if (new Date() > new Date(expiresAtStr)) {
        throw new ResponseError(400, "Kode OTP sudah kadaluarsa.");
    }
};