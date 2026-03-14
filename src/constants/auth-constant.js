export const AUTH_ERROR_MESSAGES = {
    id: {
        INVALID_CREDENTIALS: "Email atau password salah",
        UNVERIFIED_ACCOUNT: "Akun belum diverifikasi.",
        ACCOUNT_DISABLED: "Akun ini telah dinonaktifkan",
        TOO_MANY_ATTEMPTS: "Terlalu banyak percobaan login gagal (System Protection).",
        LOGIN_SERVICE_ERROR: "Layanan login bermasalah",
        EMAIL_ALREADY_VERIFIED: "Email sudah terdaftar dan aktif. Silakan login.",
        AUTH_REGISTER_FAILED: "Gagal mendaftarkan user ke Auth",
        DB_SAVE_FAILED: "Gagal menyimpan data user",
        EMAIL_OTP_REQUIRED: "Email dan Kode OTP wajib diisi.",
        EMAIL_NOT_REGISTERED: "Email tidak terdaftar.",
        EMAIL_REQUIRED: "Email wajib diisi.",
        ALREADY_VERIFIED: "Akun ini sudah terverifikasi. Silakan login.",
        USER_NOT_FOUND: "User tidak ditemukan.",
        PASSWORD_NOT_MATCH: "Konfirmasi password tidak cocok.",
        PASSWORD_UPDATE_FAILED: "Gagal mengupdate password"
    },
    en: {
        INVALID_CREDENTIALS: "Invalid email or password",
        UNVERIFIED_ACCOUNT: "Account has not been verified.",
        ACCOUNT_DISABLED: "This account has been disabled",
        TOO_MANY_ATTEMPTS: "Too many failed login attempts (System Protection).",
        LOGIN_SERVICE_ERROR: "Login service encountered an error",
        EMAIL_ALREADY_VERIFIED: "Email is already registered and active. Please login.",
        AUTH_REGISTER_FAILED: "Failed to register user to Auth",
        DB_SAVE_FAILED: "Failed to save user data",
        EMAIL_OTP_REQUIRED: "Email and OTP Code are required.",
        EMAIL_NOT_REGISTERED: "Email is not registered.",
        EMAIL_REQUIRED: "Email is required.",
        ALREADY_VERIFIED: "This account is already verified. Please login.",
        USER_NOT_FOUND: "User not found.",
        PASSWORD_NOT_MATCH: "Password confirmation does not match.",
        PASSWORD_UPDATE_FAILED: "Failed to update password"
    }
};

export const AUTH_SUCCESS_MESSAGES = {
    id: {
        LOGOUT_SUCCESS: "Logout berhasil",
        RESEND_OTP_SUCCESS: "Email sudah terdaftar namun belum diverifikasi. Kode OTP baru telah dikirim ulang. Silakan cek email Anda.",
        REGISTER_SUCCESS: "Registrasi berhasil. Kode OTP telah dikirim ke email Anda. Silakan verifikasi untuk mengaktifkan akun.",
        VERIFY_ALREADY_DONE: "Akun sudah terverifikasi sebelumnya. Silakan login.",
        VERIFY_SUCCESS: "Email berhasil diverifikasi! Akun Anda kini aktif, silakan login.",
        RESET_OTP_SENT_GENERIC: "Jika email terdaftar, kode OTP reset password akan dikirimkan.",
        RESET_OTP_SENT: "Kode OTP reset password telah dikirim ke email Anda.",
        RESET_OTP_VALID: "Kode OTP valid. Silakan atur ulang password Anda.",
        PASSWORD_RESET_SUCCESS: "Password berhasil diubah. Silakan login dengan password baru."
    },
    en: {
        LOGOUT_SUCCESS: "Logout successful",
        RESEND_OTP_SUCCESS: "Email is registered but not verified. A new OTP code has been resent. Please check your email.",
        REGISTER_SUCCESS: "Registration successful. OTP code has been sent to your email. Please verify to activate your account.",
        VERIFY_ALREADY_DONE: "Account is already verified. Please login.",
        VERIFY_SUCCESS: "Email successfully verified! Your account is now active, please login.",
        RESET_OTP_SENT_GENERIC: "If the email is registered, a password reset OTP code will be sent.",
        RESET_OTP_SENT: "Password reset OTP code has been sent to your email.",
        RESET_OTP_VALID: "Valid OTP code. Please reset your password.",
        PASSWORD_RESET_SUCCESS: "Password updated successfully. Please login with your new password."
    }
};