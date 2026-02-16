import Joi from "joi";

const updateUserValidation = Joi.object({
    name: Joi.string().min(5).max(100).optional().messages({
        'string.base': 'Nama harus berupa teks',
        'string.min': 'Nama minimal 5 karakter',
        'string.max': 'Nama maksimal 100 karakter'
    }),
    email: Joi.string().email().max(100).optional().messages({
        'string.base': 'Email harus berupa teks',
        'string.email': 'Format email tidak valid',
        'string.max': 'Email maksimal 100 karakter'
    }),
    bio: Joi.string().max(255).optional().messages({
        'string.base': 'Bio harus berupa teks',
        'string.max': 'Bio maksimal 255 karakter'
    })
});

const requestEmailChangeValidation = Joi.object({
    newEmail: Joi.string().email().max(100).required().label("Email Baru")
});

const verifyEmailChangeValidation = Joi.object({
    otp: Joi.string().length(4).required().label("Kode OTP")
});

const updatePasswordValidation = Joi.object({
    oldPassword: Joi.string().min(6).max(100).required().label("Password Lama"),
    newPassword: Joi.string().min(6).max(100).required().label("Password Baru")
});

const requestPasswordChangeValidation = Joi.object({
    oldPassword: Joi.string().required().label("Password Lama")
});

const validatePasswordChangeOtpValidation = Joi.object({
    otp: Joi.string().length(4).required().label("Kode OTP")
});

const verifyPasswordChangeValidation = Joi.object({
    otp: Joi.string().length(4).required().label("Kode OTP"),
    newPassword: Joi.string().min(6).max(100).required().label("Password Baru"),
    confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required().label("Konfirmasi Password").messages({
        "any.only": "Konfirmasi password tidak cocok"
    })
});

const deleteAccountValidation = Joi.object({
    otp: Joi.string().length(4).required().messages({
        'string.length': 'Kode OTP harus 4 digit',
        'any.required': 'Kode OTP wajib diisi untuk konfirmasi penghapusan'
    })
});

const fcmTokenValidation = Joi.object({
    token: Joi.string().required().messages({
        'string.base': 'Token harus berupa string',
        'any.required': 'Token wajib diisi',
        'string.empty': 'Token tidak boleh kosong'
    })
});

export {
    updateUserValidation,
    requestEmailChangeValidation,
    verifyEmailChangeValidation,
    updatePasswordValidation,
    requestPasswordChangeValidation,
    validatePasswordChangeOtpValidation,
    verifyPasswordChangeValidation,
    deleteAccountValidation,
    fcmTokenValidation
};