export const USER_COLLECTION = "users";

export const USER_FIELDS = {
    ID: "id",
    NAME: "name",
    EMAIL: "email",
    FCM_TOKEN: "fcm_token",
    LANGUAGE: "language",
    LAST_ENTRY: "last_entry",
    LAST_REMINDER_AT: "last_reminder_at",
    LAST_JOURNAL_ID: "last_journal_id",
    LAST_JOURNAL_SUMMARY: "last_journal_summary",
    LAST_JOURNAL_EMOTION: "last_journal_emotion"
};

export const ERROR_MESSAGES = {
    id: {
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
    },
    en: {
        USER_NOT_FOUND: "User not found",
        FILE_REQUIRED: "Photo file is required.",
        NO_PROFILE_PICTURE: "User does not have a profile picture.",
        EMAIL_SAME_AS_CURRENT: "New email cannot be the same as the current email.",
        EMAIL_ALREADY_USED: "Email is already used by another account.",
        OLD_PASSWORD_INCORRECT: "Incorrect old password",
        PASSWORD_NOT_MATCH: "Password confirmation does not match.",
        AUTH_EMAIL_EXISTS: "Email is already in use by another account (Auth).",
        AUTH_UPDATE_FAILED: "Failed to update email in authentication system.",
        ACCOUNT_DELETE_FAILED: "Failed to delete account",
        PASSWORD_UPDATE_FAILED: "Failed to update password",
    }
};

export const SUCCESS_MESSAGES = {
    id: {
        FCM_SAVED: "FCM token berhasil disimpan",
        PROFILE_PICTURE_DELETED: "Foto profil berhasil dihapus",
        EMAIL_UPDATED: "Email berhasil diubah.",
        PASSWORD_UPDATED: "Password berhasil diperbarui. Silakan login kembali.",
        ACCOUNT_DELETED: "Akun Anda telah berhasil dihapus secara permanen.",
        EMAIL_OTP_SENT: "Kode OTP telah dikirim. Silakan verifikasi untuk menyelesaikan perubahan.",
        PASSWORD_OTP_SENT: "Kode verifikasi untuk ganti password telah dikirim ke email Anda.",
        PASSWORD_OTP_VALID: "Kode OTP valid. Silakan lanjutkan ke pengisian password baru.",
        DELETE_OTP_SENT: "Kode konfirmasi penghapusan akun telah dikirim ke email Anda. Tindakan ini tidak dapat dibatalkan.",
        LANGUAGE_UPDATED: "Bahasa berhasil diubah."
    },
    en: {
        FCM_SAVED: "FCM token saved successfully",
        PROFILE_PICTURE_DELETED: "Profile picture deleted successfully",
        EMAIL_UPDATED: "Email updated successfully.",
        PASSWORD_UPDATED: "Password updated successfully. Please log in again.",
        ACCOUNT_DELETED: "Your account has been permanently deleted.",
        EMAIL_OTP_SENT: "OTP code has been sent. Please verify to complete the change.",
        PASSWORD_OTP_SENT: "Verification code to change password has been sent to your email.",
        PASSWORD_OTP_VALID: "Valid OTP code. Please proceed to enter a new password.",
        DELETE_OTP_SENT: "Account deletion confirmation code has been sent to your email. This action cannot be undone.",
        LANGUAGE_UPDATED: "Language updated successfully."
    }
};