import { database } from "../applications/database.js";
import { admin } from "../applications/firebase.js";
import { ResponseError } from "../error/response-error.js";
import axios from "axios";
import emailService from "./email-service.js";
import { 
    generateOtp, 
    checkCooldown, 
    checkLockout,
    calculateLoginLockout 
} from "../utils/security-util.js";

const GOOGLE_API_KEY = process.env.GOOGLE_CLIENT_API_KEY;

/**
 * 1. Register User Baru
*/
const register = async (request) => {
    const userCheck = await database.collection("users")
        .where("email", "==", request.email)
        .limit(1)
        .get();

    if (!userCheck.empty) {
        const userDoc = userCheck.docs[0];
        const userData = userDoc.data();

        if (userData.email_verified_at) {
            throw new ResponseError(400, "Email sudah terdaftar dan aktif. Silakan login.");
        }

        const { newCount, newTimestamp } = checkCooldown(
            userData.verification_last_sent_at, 
            userData.verification_request_count
        );

        const newOtp = generateOtp();
        const newExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        await database.collection("users").doc(userDoc.id).update({
            otp_code: newOtp,
            otp_expires_at: newExpiresAt,
            verification_request_count: newCount,
            verification_last_sent_at: newTimestamp,
            verification_fail_count: 0,
            verification_locked_until: null,
            updated_at: new Date().toISOString()
        });

        try {
            await emailService.sendVerificationOtp(userData.email, userData.name, newOtp);
        } catch (emailError) {
            console.error("Gagal mengirim email resend:", emailError);
        }

        return {
            email: userData.email,
            is_resend: true,
            message: "Email sudah terdaftar namun belum diverifikasi. Kode OTP baru telah dikirim ulang. Silakan cek email Anda."
        };
    }

    let userRecord;

    try {
        userRecord = await admin.auth().createUser({
            email: request.email,
            password: request.password,
            displayName: request.name
        });
    } catch (error) {
        throw new ResponseError(400, `Gagal mendaftarkan user ke Auth: ${error.message}`);
    }

    const now = new Date().toISOString();
    const otpCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const userData = {
        uid: userRecord.uid,
        name: request.name,
        email: request.email,
        password: "encrypted_by_firebase",
        photoUrl: null,
        email_verified_at: null,
        
        otp_code: otpCode,
        otp_expires_at: otpExpiresAt,
        
        verification_request_count: 1,
        verification_last_sent_at: now,
        verification_fail_count: 0,
        verification_locked_until: null,

        fcm_token: null,
        last_entry_at: null,
        created_at: now,
        updated_at: now
    };

    try {
        await database.collection("users").doc(userRecord.uid).set(userData);
    } catch (error) {
        await admin.auth().deleteUser(userRecord.uid);
        throw new ResponseError(500, `Gagal menyimpan data user: ${error.message}`);
    }

    try {
        await emailService.sendVerificationOtp(request.email, request.name, otpCode);
    } catch (emailError) {
        console.error("Gagal mengirim email verifikasi:", emailError);
    }

    return {
        email: userData.email,
        is_resend: false,
        message: "Registrasi berhasil. Kode OTP telah dikirim ke email Anda. Silakan verifikasi untuk mengaktifkan akun."
    };
}

/**
 * 2. Login User
 * Menggunakan calculateLoginLockout (Max 5x salah, Lock 15 menit)
 */
const login = async (request) => {
    const userSnapshot = await database.collection("users").where("email", "==", request.email).limit(1).get();
    
    if (userSnapshot.empty) {
        throw new ResponseError(401, "Email atau password salah");
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    checkLockout(userData.login_locked_until);

    if (!userData.email_verified_at) {
        throw new ResponseError(403, "Akun belum diverifikasi.");
    }

    const loginUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${GOOGLE_API_KEY}`;

    try {
        const response = await axios.post(loginUrl, {
            email: request.email,
            password: request.password,
            returnSecureToken: true
        });

        const { idToken, localId, refreshToken, expiresIn } = response.data;

        await database.collection("users").doc(localId).update({
            last_entry_at: new Date().toISOString(),
            login_fail_count: 0,
            login_locked_until: null
        });

        return {
            token: idToken,
            refreshToken: refreshToken,
            expiresIn: expiresIn,
            user: {
                uid: localId,
                name: userData.name,
                email: userData.email,
                email_verified_at: userData.email_verified_at
            }
        };

    } catch (error) {
        if (error.response) {
            const errorCode = error.response.data.error.message;

            if (errorCode === "INVALID_PASSWORD" || errorCode === "INVALID_LOGIN_CREDENTIALS") {
                
                const { newCount, lockedUntil, isLocked, message } = calculateLoginLockout(
                    userData.login_fail_count, 
                    5, 
                    15 
                );

                await database.collection("users").doc(userId).update({
                    login_fail_count: newCount,
                    login_locked_until: lockedUntil
                });

                if (isLocked) {
                    throw new ResponseError(429, message);
                } else {
                    throw new ResponseError(401, message);
                }

            } else if (errorCode === "EMAIL_NOT_FOUND") {
                throw new ResponseError(401, "Email atau password salah");
            } else if (errorCode === "USER_DISABLED") {
                throw new ResponseError(403, "Akun ini telah dinonaktifkan");
            } else if (errorCode === "TOO_MANY_ATTEMPTS_TRY_LATER") {
                throw new ResponseError(429, "Terlalu banyak percobaan login gagal (System Protection).");
            }
        }
        
        console.error("Login Error:", error);
        throw new ResponseError(500, "Layanan login bermasalah");
    }
}

/**
 * Logout user
 */
const logout = async (user) => {
    try {
        await admin.auth().revokeRefreshTokens(user.uid);
    } catch (error) {    
        console.error("Gagal revoke token:", error);
    }
    return { message: "Logout berhasil" };
}

/**
 * 3. Verifikasi OTP Registrasi (PUBLIC)
 * Menggunakan checkLockout & Fail Counter (Max 3x salah, Lock 1 jam)
 */
const verifyOtp = async (request) => {
    const { email, otp } = request;
    if (!email || !otp) throw new ResponseError(400, "Email dan Kode OTP wajib diisi.");

    const userSnapshot = await database.collection("users").where("email", "==", email).limit(1).get();
    
    if (userSnapshot.empty) {
        throw new ResponseError(404, "Email tidak terdaftar.");
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    checkLockout(userData.verification_locked_until);

    if (userData.email_verified_at) {
        return { message: "Akun sudah terverifikasi sebelumnya. Silakan login." };
    }

    if (userData.otp_code !== otp) {
        const currentFailCount = (userData.verification_fail_count || 0) + 1;
        let updateData = { verification_fail_count: currentFailCount };

        if (currentFailCount >= 3) {
            const lockedUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            updateData.verification_locked_until = lockedUntil;
            updateData.otp_code = null;
            
            await database.collection("users").doc(userId).update(updateData);
            throw new ResponseError(429, "Anda salah memasukkan OTP 3 kali. Verifikasi dikunci selama 1 jam.");
        }

        await database.collection("users").doc(userId).update(updateData);
        throw new ResponseError(400, `Kode OTP salah. Sisa percobaan: ${3 - currentFailCount}`);
    }

    const now = new Date();
    const expiresAt = new Date(userData.otp_expires_at);
    if (now > expiresAt) {
        throw new ResponseError(400, "Kode OTP sudah kadaluarsa. Silakan minta kode baru.");
    }

    const verifyTime = now.toISOString();
    
    await database.collection("users").doc(userId).update({ 
        email_verified_at: verifyTime,
        otp_code: null,
        otp_expires_at: null,
        verification_fail_count: 0,
        verification_locked_until: null,
        updated_at: verifyTime
    });

    try { 
        await admin.auth().updateUser(userId, { emailVerified: true }); 
    } catch (e) { 
        console.error("Gagal update status verified di Auth:", e.message); 
    }

    return { 
        message: "Email berhasil diverifikasi! Akun Anda kini aktif, silakan login.",
        email: email
    };
}

/**
 * 4. Kirim Ulang OTP Registrasi
 */
const sendVerificationOtp = async (request) => {
    const { email } = request;
    if (!email) throw new ResponseError(400, "Email wajib diisi.");

    const userSnapshot = await database.collection("users").where("email", "==", email).limit(1).get();
    
    if (userSnapshot.empty) {
        return {
            message: `Kode OTP baru dikirim ke email ${email}.`,
            expires_in: "5 minutes"
        }
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    if (userData.email_verified_at) {
        throw new ResponseError(400, "Akun ini sudah terverifikasi. Silakan login.");
    }

    const { newCount, newTimestamp } = checkCooldown(
        userData.verification_last_sent_at, 
        userData.verification_request_count
    );

    const newOtp = generateOtp();
    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();

    await database.collection("users").doc(userId).update({
        otp_code: newOtp,
        otp_expires_at: newExpiresAt,
        verification_request_count: newCount,
        verification_last_sent_at: newTimestamp,
        verification_fail_count: 0,
        verification_locked_until: null,
        updated_at: now.toISOString()
    });

    await emailService.sendVerificationOtp(userData.email, userData.name, newOtp);

    return {
        message: `Kode OTP baru dikirim ke email ${email}.`,
        expires_in: "5 minutes"
    };
}

/**
 * 6. Request OTP Lupa Password (Step 1)
 */
const forgotPassword = async (request) => {
    const { email } = request;
    if (!email) throw new ResponseError(400, "Email wajib diisi.");

    const userSnapshot = await database.collection("users").where("email", "==", email).limit(1).get();

    if (userSnapshot.empty) {
        return { message: "Jika email terdaftar, kode OTP reset password akan dikirimkan." };
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    const { newCount, newTimestamp } = checkCooldown(
        userData.password_reset_last_sent_at, 
        userData.password_reset_request_count
    );

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); 

    await database.collection("users").doc(userId).update({
        password_reset_otp: otpCode,
        password_reset_expires: expiresAt,
        password_reset_request_count: newCount,
        password_reset_last_sent_at: newTimestamp,
        password_reset_fail_count: 0,
        password_reset_locked_until: null,
        updated_at: new Date().toISOString()
    });

    try {
        await emailService.sendResetPasswordOtp(email, userData.name, otpCode);
    } catch (error) {
        console.error("Gagal mengirim email reset password:", error);
    }

    return { message: "Kode OTP reset password telah dikirim ke email Anda." };
}

/**
 * 7. Verifikasi OTP Reset Password (Step 2)
 * Menggunakan checkLockout & Fail Counter
 */
const verifyResetOtp = async (request) => {
    const { email, otp } = request;
    if (!email || !otp) throw new ResponseError(400, "Email dan OTP wajib diisi.");

    const userSnapshot = await database.collection("users").where("email", "==", email).limit(1).get();
    if (userSnapshot.empty) throw new ResponseError(404, "User tidak ditemukan.");

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    checkLockout(userData.password_reset_locked_until);
    
    if (userData.password_reset_otp !== otp) {
        const currentFailCount = (userData.password_reset_fail_count || 0) + 1;
        let updateData = { password_reset_fail_count: currentFailCount };

        if (currentFailCount >= 3) {
            const lockedUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            updateData.password_reset_locked_until = lockedUntil;
            updateData.password_reset_otp = null;
            
            await database.collection("users").doc(userId).update(updateData);
            throw new ResponseError(429, "Anda salah memasukkan OTP 3 kali. Silakan tunggu 1 jam sebelum mencoba lagi.");
        }

        await database.collection("users").doc(userId).update(updateData);
        throw new ResponseError(400, `Kode OTP salah. Sisa percobaan: ${3 - currentFailCount}`);
    }

    if (new Date() > new Date(userData.password_reset_expires)) {
        throw new ResponseError(400, "Kode OTP sudah kadaluarsa.");
    }

    return { 
        message: "Kode OTP valid. Silakan atur ulang password Anda.",
        email: email,
        otp: otp 
    };
}

/**
 * 8. Proses Reset Password Baru (Step 3)
 * Menggunakan checkLockout & Fail Counter (Double Security)
 */
const resetPassword = async (request) => {
    const { email, otp, password, password_confirmation } = request;

    if (password !== password_confirmation) throw new ResponseError(400, "Konfirmasi password tidak cocok.");

    const userSnapshot = await database.collection("users").where("email", "==", email).limit(1).get();
    if (userSnapshot.empty) throw new ResponseError(404, "User tidak ditemukan.");

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    checkLockout(userData.password_reset_locked_until);

    if (userData.password_reset_otp !== otp) {
         const currentFailCount = (userData.password_reset_fail_count || 0) + 1;
         let updateData = { password_reset_fail_count: currentFailCount };
 
         if (currentFailCount >= 3) {
             const lockedUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();
             updateData.password_reset_locked_until = lockedUntil;
             updateData.password_reset_otp = null;
             await database.collection("users").doc(userId).update(updateData);
             throw new ResponseError(429, "Anda salah memasukkan OTP 3 kali. Silakan tunggu 1 jam.");
         }
 
         await database.collection("users").doc(userId).update(updateData);
         throw new ResponseError(400, "Sesi reset password tidak valid atau OTP salah.");
    }
    
    if (new Date() > new Date(userData.password_reset_expires)) {
        throw new ResponseError(400, "Sesi reset password sudah kadaluarsa.");
    }

    try {
        await admin.auth().updateUser(userId, { password: password });
        await admin.auth().revokeRefreshTokens(userId);
        await database.collection("users").doc(userId).update({
            password_reset_otp: null,
            password_reset_expires: null,
            password_reset_request_count: 0,
            password_reset_fail_count: 0,  
            password_reset_locked_until: null,
            updated_at: new Date().toISOString()
        });

    } catch (error) {
        throw new ResponseError(500, `Gagal mengupdate password: ${error.message}`);
    }

    return { message: "Password berhasil diubah. Silakan login dengan password baru." };
};

export default {
    register,
    login,
    logout,
    sendVerificationOtp,
    verifyOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword
}