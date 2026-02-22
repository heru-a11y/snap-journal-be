export const AUTH_ERROR_MESSAGES = {
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
};

export const AUTH_SUCCESS_MESSAGES = {
    LOGOUT_SUCCESS: "Logout berhasil",
    RESEND_OTP_SUCCESS: "Email sudah terdaftar namun belum diverifikasi. Kode OTP baru telah dikirim ulang. Silakan cek email Anda.",
    REGISTER_SUCCESS: "Registrasi berhasil. Kode OTP telah dikirim ke email Anda. Silakan verifikasi untuk mengaktifkan akun.",
    VERIFY_ALREADY_DONE: "Akun sudah terverifikasi sebelumnya. Silakan login.",
    VERIFY_SUCCESS: "Email berhasil diverifikasi! Akun Anda kini aktif, silakan login.",
    RESET_OTP_SENT_GENERIC: "Jika email terdaftar, kode OTP reset password akan dikirimkan.",
    RESET_OTP_SENT: "Kode OTP reset password telah dikirim ke email Anda.",
    RESET_OTP_VALID: "Kode OTP valid. Silakan atur ulang password Anda.",
    PASSWORD_RESET_SUCCESS: "Password berhasil diubah. Silakan login dengan password baru."
};