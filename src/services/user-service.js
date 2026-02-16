import { database } from "../applications/database.js";
import { admin } from "../applications/firebase.js";
import { ResponseError } from "../error/response-error.js";
import uploadService from "./upload-service.js";
import deleteService from "./delete-service.js";
import emailService from "./email-service.js";
import axios from "axios";
import { generateOtp, checkLockout } from "../utils/security-util.js";

const GOOGLE_API_KEY = process.env.GOOGLE_CLIENT_API_KEY;

/**
 * Mendapatkan profil user saat ini
 */
const getProfile = async (user) => {
    const userRef = database.collection("users").doc(user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        throw new ResponseError(404, "User tidak ditemukan");
    }

    const userData = userDoc.data();

    return {
        uid: user.uid,
        name: userData.name,
        email: userData.email,
        bio: userData.bio || null,
        photoUrl: userData.photoUrl || null,
        fcm_token: userData.fcm_token || null
    };
}

/**
 * Mengupdate profil user
 */
const updateProfile = async (user, request) => {
    const userRef = database.collection("users").doc(user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) throw new ResponseError(404, "User tidak ditemukan");

    const updateData = {
        updated_at: new Date().toISOString()
    };
    const authUpdates = {};

    if (request.name) {
        updateData.name = request.name;
        authUpdates.displayName = request.name;
    }

    if (request.bio) {
        updateData.bio = request.bio;
    }

    if (Object.keys(authUpdates).length > 0) {
        try {
            await admin.auth().updateUser(user.uid, authUpdates);
        } catch (error) {
            console.error("Gagal update Firebase Auth:", error);
        }
    }

    await userRef.update(updateData);
    
    const finalDoc = await userRef.get();
    return finalDoc.data();
}

/**
 * Request Ganti Email
 * [UPDATE] Reset fail count & check lockout
 */
const requestEmailChange = async (user, request) => {
    const { newEmail } = request;
    
    const userRef = database.collection("users").doc(user.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    checkLockout(userData.email_change_locked_until);

    if (userData.email === newEmail) {
        throw new ResponseError(400, "Email baru tidak boleh sama dengan email saat ini.");
    }

    const emailCheck = await database.collection("users").where("email", "==", newEmail).get();
    if (!emailCheck.empty) {
        throw new ResponseError(400, "Email sudah digunakan oleh akun lain.");
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await userRef.update({
        pending_email: newEmail,
        pending_email_otp: otp,
        pending_email_expires: expiresAt,
        email_change_fail_count: 0,
        email_change_locked_until: null,
        updated_at: new Date().toISOString()
    });

    await emailService.sendChangeEmailOtp(newEmail, userData.name, otp);

    return {
        message: `Kode OTP telah dikirim ke ${newEmail}. Silakan verifikasi untuk menyelesaikan perubahan.`,
        target_email: newEmail
    };
}

/**
 * Verifikasi Ganti Email
 * [UPDATE] Implementasi Rate Limiting (3x Gagal -> Lock 1 Jam)
 */
const verifyEmailChange = async (user, request) => {
    const { otp } = request;
    const userRef = database.collection("users").doc(user.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    checkLockout(userData.email_change_locked_until);

    if (!userData.pending_email || !userData.pending_email_otp) {
        throw new ResponseError(400, "Tidak ada permintaan perubahan email yang aktif.");
    }

    if (userData.pending_email_otp !== otp) {
        const currentFailCount = (userData.email_change_fail_count || 0) + 1;
        let updateData = { email_change_fail_count: currentFailCount };

        if (currentFailCount >= 3) {
            const lockedUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            updateData.email_change_locked_until = lockedUntil;
            updateData.pending_email_otp = null;
            
            await userRef.update(updateData);
            throw new ResponseError(429, "Anda salah memasukkan OTP 3 kali. Fitur ganti email dikunci sementara selama 1 jam.");
        }

        await userRef.update(updateData);
        throw new ResponseError(400, `Kode OTP salah. Sisa percobaan: ${3 - currentFailCount}`);
    }

    if (new Date() > new Date(userData.pending_email_expires)) {
        throw new ResponseError(400, "Kode OTP sudah kadaluarsa. Silakan request ulang.");
    }

    const newEmail = userData.pending_email;

    try {
        await admin.auth().updateUser(user.uid, { email: newEmail });
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            throw new ResponseError(400, "Email sudah digunakan akun lain (Auth).");
        }
        throw new ResponseError(500, "Gagal mengupdate email di sistem autentikasi.");
    }

    await userRef.update({
        email: newEmail,
        email_verified_at: new Date().toISOString(),
        pending_email: null,
        pending_email_otp: null,
        pending_email_expires: null,
        email_change_fail_count: 0,
        email_change_locked_until: null,
        updated_at: new Date().toISOString()
    });

    return {
        message: "Email berhasil diubah.",
        email: newEmail
    };
}

/**
 * Memperbarui foto profil pengguna.
 */
const updateProfilePicture = async (user, file) => {
    if (!file) {
        throw new ResponseError(400, "File foto wajib diupload.");
    }

    const userRef = database.collection("users").doc(user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) throw new ResponseError(404, "User tidak ditemukan");
    
    const userData = userDoc.data();

    if (userData.photoUrl) {
        try {
            await deleteService.removeFile(user, userData.photoUrl);
        } catch (e) {
            console.warn("Gagal menghapus foto lama (lanjut upload baru):", e.message);
        }
    }

    const newPhotoUrl = await uploadService.uploadProfilePicture(user, file);
    const updateTime = new Date().toISOString();
    
    await userRef.update({
        photoUrl: newPhotoUrl,
        updated_at: updateTime
    });

    try {
        await admin.auth().updateUser(user.uid, {
            photoURL: newPhotoUrl
        });
    } catch (error) {
        console.error("Gagal update Firebase Auth PhotoURL:", error);
    }

    return {
        photoUrl: newPhotoUrl,
        updated_at: updateTime
    };
}

/**
 * Menghapus foto profil pengguna.
 */
const removeProfilePicture = async (user) => {
    const userRef = database.collection("users").doc(user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) throw new ResponseError(404, "User tidak ditemukan");
    
    const userData = userDoc.data();

    if (!userData.photoUrl) {
        throw new ResponseError(400, "User tidak memiliki foto profil.");
    }

    try {
        await deleteService.removeFile(user, userData.photoUrl);
    } catch (e) {
        console.warn("File fisik mungkin sudah hilang atau error:", e.message);
    }

    await userRef.update({
        photoUrl: null,
        updated_at: new Date().toISOString()
    });

    try {
        await admin.auth().updateUser(user.uid, {
            photoURL: null
        });
    } catch (error) {
        console.error("Gagal hapus PhotoURL di Auth:", error);
    }

    return {
        message: "Foto profil berhasil dihapus"
    };
}

/**
 * Langkah 1: Request Ganti Password
 */
const requestPasswordChange = async (user, request) => {
    const userRef = database.collection("users").doc(user.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) throw new ResponseError(404, "User tidak ditemukan");
    
    const userData = userDoc.data();

    checkLockout(userData.password_update_locked_until);

    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${GOOGLE_API_KEY}`;
    try {
        await axios.post(verifyUrl, {
            email: userData.email,
            password: request.oldPassword,
            returnSecureToken: true
        });
    } catch (error) {
        throw new ResponseError(401, "Password lama salah");
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await userRef.update({
        password_update_otp: otp,
        password_update_expires: expiresAt,
        password_update_fail_count: 0,
        password_update_locked_until: null, 
        updated_at: new Date().toISOString()
    });

    await emailService.sendUpdatePasswordOtp(userData.email, userData.name, otp);

    return {
        message: "Kode verifikasi untuk ganti password telah dikirim ke email Anda."
    };
}

/**
 * Langkah 2 (Tengah): Validasi OTP Saja
 */
const validatePasswordChangeOtp = async (user, request) => {
    const { otp } = request;
    const userRef = database.collection("users").doc(user.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    checkLockout(userData.password_update_locked_until);

    if (!userData.password_update_otp) {
        throw new ResponseError(400, "Tidak ada permintaan ganti password yang aktif.");
    }

    if (userData.password_update_otp !== otp) {
        const currentFailCount = (userData.password_update_fail_count || 0) + 1;
        let updateData = { password_update_fail_count: currentFailCount };

        if (currentFailCount >= 3) {
            const lockedUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            updateData.password_update_locked_until = lockedUntil;
            updateData.password_update_otp = null;
            await userRef.update(updateData);
            throw new ResponseError(429, "Anda salah memasukkan OTP 3 kali. Silakan tunggu 1 jam sebelum meminta kode baru.");
        } 

        await userRef.update(updateData);
        throw new ResponseError(400, `Kode OTP salah. Sisa percobaan: ${3 - currentFailCount}`);
    }

    if (new Date() > new Date(userData.password_update_expires)) {
        throw new ResponseError(400, "Kode OTP sudah kadaluarsa. Silakan request ulang.");
    }

    return {
        message: "Kode OTP valid. Silakan lanjutkan ke pengisian password baru."
    };
}

/**
 * Langkah 3: Verifikasi OTP & Update Password
 */
const verifyPasswordChange = async (user, request) => {
    const { otp, newPassword, confirmPassword } = request;

    if (newPassword !== confirmPassword) {
        throw new ResponseError(400, "Konfirmasi password tidak cocok.");
    }

    const userRef = database.collection("users").doc(user.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    checkLockout(userData.password_update_locked_until);

    if (!userData.password_update_otp || userData.password_update_otp !== otp) {
        const currentFailCount = (userData.password_update_fail_count || 0) + 1;
        let updateData = { password_update_fail_count: currentFailCount };

        if (currentFailCount >= 3) {
            const lockedUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            updateData.password_update_locked_until = lockedUntil;
            updateData.password_update_otp = null;
            await userRef.update(updateData);
            throw new ResponseError(429, "Anda salah memasukkan OTP 3 kali. Silakan tunggu 1 jam sebelum mencoba lagi.");
        } 

        await userRef.update(updateData);
        throw new ResponseError(400, "Kode OTP salah.");
    }

    if (new Date() > new Date(userData.password_update_expires)) {
        throw new ResponseError(400, "Kode OTP sudah kadaluarsa. Silakan ulangi permintaan.");
    }

    try {
        await admin.auth().updateUser(user.uid, {
            password: newPassword
        });
        await admin.auth().revokeRefreshTokens(user.uid);
    } catch (error) {
        throw new ResponseError(500, `Gagal update password: ${error.message}`);
    }

    await userRef.update({
        password_update_otp: null,
        password_update_expires: null,
        password_update_fail_count: 0,
        password_update_locked_until: null,
        updated_at: new Date().toISOString()
    });

    return {
        message: "Password berhasil diperbarui. Silakan login kembali."
    };
}

/**
 * Langkah 1: Request Hapus Akun
 */
const requestDeleteAccount = async (user) => {
    const userRef = database.collection("users").doc(user.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) throw new ResponseError(404, "User tidak ditemukan");
    
    const userData = userDoc.data();

    checkLockout(userData.delete_account_locked_until);

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await userRef.update({
        delete_account_otp: otp,
        delete_account_expires: expiresAt,
        delete_account_fail_count: 0,
        delete_account_locked_until: null,
        updated_at: new Date().toISOString()
    });

    await emailService.sendDeleteAccountOtp(userData.email, userData.name, otp);

    return {
        message: "Kode konfirmasi penghapusan akun telah dikirim ke email Anda. Tindakan ini tidak dapat dibatalkan."
    };
}

/**
 * Langkah 2: Verifikasi OTP & Hapus Akun
 */
const deleteAccount = async (user, request) => {
    const { otp } = request;
    const userRef = database.collection("users").doc(user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) throw new ResponseError(404, "User tidak ditemukan");
    const userData = userDoc.data();

    checkLockout(userData.delete_account_locked_until);

    if (!userData.delete_account_otp) {
        throw new ResponseError(400, "Tidak ada permintaan penghapusan akun yang aktif.");
    }

    if (userData.delete_account_otp !== otp) {
        const currentFailCount = (userData.delete_account_fail_count || 0) + 1;
        let updateData = { delete_account_fail_count: currentFailCount };

        if (currentFailCount >= 3) {
            const lockedUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            updateData.delete_account_locked_until = lockedUntil;
            updateData.delete_account_otp = null;
            await userRef.update(updateData);
            throw new ResponseError(429, "Anda salah memasukkan OTP 3 kali. Fitur hapus akun dikunci sementara.");
        }

        await userRef.update(updateData);
        throw new ResponseError(400, `Kode OTP salah. Sisa percobaan: ${3 - currentFailCount}`);
    }

    if (new Date() > new Date(userData.delete_account_expires)) {
        throw new ResponseError(400, "Kode OTP sudah kadaluarsa.");
    }

    try {
        await admin.auth().deleteUser(user.uid);
        await userRef.delete();
        
        return {
            message: "Akun Anda telah berhasil dihapus secara permanen."
        };
    } catch (error) {
        throw new ResponseError(500, `Gagal menghapus akun: ${error.message}`);
    }
}

/**
 * Menyimpan FCM Token
 */
const setFcmToken = async (user, request) => {
    const userRef = database.collection("users").doc(user.uid);
    const doc = await userRef.get();
    if (!doc.exists) {
        throw new ResponseError(404, "User tidak ditemukan");
    }

    await userRef.update({
        fcm_token: request.token,
        updated_at: new Date().toISOString()
    });

    return {
        message: "FCM token berhasil disimpan",
        user_id: user.uid
    };
}

export default {
    getProfile,
    updateProfile,
    requestEmailChange,
    verifyEmailChange,
    updateProfilePicture,
    removeProfilePicture,
    requestPasswordChange,
    validatePasswordChangeOtp,
    verifyPasswordChange,
    requestDeleteAccount,
    deleteAccount,
    setFcmToken
}