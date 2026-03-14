export const LOG_PREFIX = "[Email Service]";

export const EMAIL_CONFIG = {
    VERIFICATION: {
        id: {
            templateFile: "id/verification-email.html", 
            subject: "Kode Verifikasi (OTP) - Snap Journal",
        },
        en: {
            templateFile: "en/verification-email.html", 
            subject: "Verification Code (OTP) - Snap Journal",
        },
        logName: "Verification OTP",
        errorMessage: "Gagal mengirim email verifikasi."
    },
    RESET_PASSWORD: {
        id: {
            templateFile: "id/reset-password.html",
            subject: "Permintaan Reset Password - Snap Journal",
        },
        en: {
            templateFile: "en/reset-password.html",
            subject: "Password Reset Request - Snap Journal",
        },
        logName: "Reset Password OTP",
        errorMessage: "Gagal mengirim email reset password."
    },
    UPDATE_PASSWORD: {
        id: {
            templateFile: "id/update-password.html",
            subject: "Keamanan Akun: Kode Verifikasi Ganti Password - Snap Journal",
        },
        en: {
            templateFile: "en/update-password.html",
            subject: "Account Security: Change Password Verification Code - Snap Journal",
        },
        logName: "Update Password OTP",
        errorMessage: "Gagal mengirim email OTP ganti password."
    },
    CHANGE_EMAIL: {
        id: {
            templateFile: "id/change-email.html",
            subject: "Konfirmasi Perubahan Email - Snap Journal",
        },
        en: {
            templateFile: "en/change-email.html",
            subject: "Email Change Confirmation - Snap Journal",
        },
        logName: "Change Email OTP",
        errorMessage: "Gagal mengirim email OTP."
    },
    DELETE_ACCOUNT: {
        id: {
            templateFile: "id/delete-account.html",
            subject: "PENTING: Kode Konfirmasi Penghapusan Akun - Snap Journal",
        },
        en: {
            templateFile: "en/delete-account.html",
            subject: "IMPORTANT: Account Deletion Confirmation Code - Snap Journal",
        },
        logName: "Delete Account OTP",
        errorMessage: "Gagal mengirim email OTP hapus akun."
    }
};