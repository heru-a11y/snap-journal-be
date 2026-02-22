export const LOG_PREFIX = "[Email Service]";

export const EMAIL_CONFIG = {
    VERIFICATION: {
        templateFile: "verification-email.html",
        subject: "Kode Verifikasi (OTP) - Snap Journal",
        logName: "Verification OTP",
        errorMessage: "Gagal mengirim email verifikasi."
    },
    RESET_PASSWORD: {
        templateFile: "reset-password.html",
        subject: "Permintaan Reset Password - Snap Journal",
        logName: "Reset Password OTP",
        errorMessage: "Gagal mengirim email reset password."
    },
    UPDATE_PASSWORD: {
        templateFile: "update-password.html",
        subject: "Keamanan Akun: Kode Verifikasi Ganti Password - Snap Journal",
        logName: "Update Password OTP",
        errorMessage: "Gagal mengirim email OTP ganti password."
    },
    CHANGE_EMAIL: {
        templateFile: "change-email.html",
        subject: "Konfirmasi Perubahan Email - Snap Journal",
        logName: "Change Email OTP",
        errorMessage: "Gagal mengirim email OTP."
    },
    DELETE_ACCOUNT: {
        templateFile: "delete-account.html",
        subject: "PENTING: Kode Konfirmasi Penghapusan Akun - Snap Journal",
        logName: "Delete Account OTP",
        errorMessage: "Gagal mengirim email OTP hapus akun."
    }
};