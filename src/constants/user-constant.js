export const USER_COLLECTION = "users";

export const USER_FIELDS = {
    ID: "id",
    NAME: "name",
    EMAIL: "email",
    FCM_TOKEN: "fcm_token",
    LAST_ENTRY: "last_entry",
    LAST_REMINDER_AT: "last_reminder_at",
    LAST_JOURNAL_ID: "last_journal_id",
    LAST_JOURNAL_SUMMARY: "last_journal_summary",
    LAST_JOURNAL_EMOTION: "last_journal_emotion"
};

export const ERROR_MESSAGES = {
    USER_NOT_FOUND: "User tidak ditemukan",
    FILE_REQUIRED: "File foto wajib diupload.",
    NO_PROFILE_PICTURE: "User tidak memiliki foto profil.",
    EMAIL_SAME_AS_CURRENT: "Email baru tidak boleh sama dengan email saat ini.",
    EMAIL_ALREADY_USED: "Email sudah digunakan oleh akun lain.",
    OLD_PASSWORD_INCORRECT: "Password lama salah",
    PASSWORD_NOT_MATCH: "Konfirmasi password tidak cocok.",
    AUTH_EMAIL_EXISTS: "Email sudah digunakan akun lain (Auth).",
    AUTH_UPDATE_FAILED: "Gagal mengupdate email di sistem autentikasi.",
    ACCOUNT_DELETE_FAILED: "Gagal menghapus akun",
    PASSWORD_UPDATE_FAILED: "Gagal update password",
};

export const SUCCESS_MESSAGES = {
    FCM_SAVED: "FCM token berhasil disimpan",
    PROFILE_PICTURE_DELETED: "Foto profil berhasil dihapus",
    EMAIL_UPDATED: "Email berhasil diubah.",
    PASSWORD_UPDATED: "Password berhasil diperbarui. Silakan login kembali.",
    ACCOUNT_DELETED: "Akun Anda telah berhasil dihapus secara permanen.",
    EMAIL_OTP_SENT: "Kode OTP telah dikirim. Silakan verifikasi untuk menyelesaikan perubahan.",
    PASSWORD_OTP_SENT: "Kode verifikasi untuk ganti password telah dikirim ke email Anda.",
    PASSWORD_OTP_VALID: "Kode OTP valid. Silakan lanjutkan ke pengisian password baru.",
    DELETE_OTP_SENT: "Kode konfirmasi penghapusan akun telah dikirim ke email Anda. Tindakan ini tidak dapat dibatalkan."
};