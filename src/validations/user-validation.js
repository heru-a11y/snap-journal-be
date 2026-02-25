import Joi from "joi";

const updateUserValidation = (lang = 'id') => Joi.object({
    name: Joi.string().min(5).max(100).optional().messages({
        'string.base': lang === 'en' ? 'Name must be a text' : 'Nama harus berupa teks',
        'string.min': lang === 'en' ? 'Name minimum 5 characters' : 'Nama minimal 5 karakter',
        'string.max': lang === 'en' ? 'Name maximum 100 characters' : 'Nama maksimal 100 karakter'
    }),
    email: Joi.string().email().max(100).optional().messages({
        'string.base': lang === 'en' ? 'Email must be a text' : 'Email harus berupa teks',
        'string.email': lang === 'en' ? 'Invalid email format' : 'Format email tidak valid',
        'string.max': lang === 'en' ? 'Email maximum 100 characters' : 'Email maksimal 100 karakter'
    }),
    bio: Joi.string().max(255).optional().messages({
        'string.base': lang === 'en' ? 'Bio must be a text' : 'Bio harus berupa teks',
        'string.max': lang === 'en' ? 'Bio maximum 255 characters' : 'Bio maksimal 255 karakter'
    })
});

const updateLanguageValidation = (lang = 'id') => Joi.object({
    language: Joi.string().valid('id', 'en').required().messages({
        'any.only': lang === 'en' ? 'Supported languages are only id or en' : 'Bahasa yang didukung hanya id atau en',
        'any.required': lang === 'en' ? 'Language is required' : 'Bahasa wajib diisi',
        'string.base': lang === 'en' ? 'Language must be a string' : 'Bahasa harus berupa string'
    })
});

const requestEmailChangeValidation = (lang = 'id') => Joi.object({
    newEmail: Joi.string().email().max(100).required().label(lang === 'en' ? "New Email" : "Email Baru")
});

const verifyEmailChangeValidation = (lang = 'id') => Joi.object({
    otp: Joi.string().length(4).required().label(lang === 'en' ? "OTP Code" : "Kode OTP")
});

const updatePasswordValidation = (lang = 'id') => Joi.object({
    oldPassword: Joi.string().min(6).max(100).required().label(lang === 'en' ? "Old Password" : "Password Lama"),
    newPassword: Joi.string().min(6).max(100).required().label(lang === 'en' ? "New Password" : "Password Baru")
});

const requestPasswordChangeValidation = (lang = 'id') => Joi.object({
    oldPassword: Joi.string().required().label(lang === 'en' ? "Old Password" : "Password Lama")
});

const validatePasswordChangeOtpValidation = (lang = 'id') => Joi.object({
    otp: Joi.string().length(4).required().label(lang === 'en' ? "OTP Code" : "Kode OTP")
});

const verifyPasswordChangeValidation = (lang = 'id') => Joi.object({
    otp: Joi.string().length(4).required().label(lang === 'en' ? "OTP Code" : "Kode OTP"),
    newPassword: Joi.string().min(6).max(100).required().label(lang === 'en' ? "New Password" : "Password Baru"),
    confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required().label(lang === 'en' ? "Confirm Password" : "Konfirmasi Password").messages({
        "any.only": lang === 'en' ? "Password confirmation does not match" : "Konfirmasi password tidak cocok"
    })
});

const deleteAccountValidation = (lang = 'id') => Joi.object({
    otp: Joi.string().length(4).required().messages({
        'string.length': lang === 'en' ? 'OTP code must be 4 digits' : 'Kode OTP harus 4 digit',
        'any.required': lang === 'en' ? 'OTP code is required for deletion confirmation' : 'Kode OTP wajib diisi untuk konfirmasi penghapusan'
    })
});

const fcmTokenValidation = (lang = 'id') => Joi.object({
    token: Joi.string().required().messages({
        'string.base': lang === 'en' ? 'Token must be a string' : 'Token harus berupa string',
        'any.required': lang === 'en' ? 'Token is required' : 'Token wajib diisi',
        'string.empty': lang === 'en' ? 'Token cannot be empty' : 'Token tidak boleh kosong'
    })
});

export {
    updateUserValidation,
    updateLanguageValidation,
    requestEmailChangeValidation,
    verifyEmailChangeValidation,
    updatePasswordValidation,
    requestPasswordChangeValidation,
    validatePasswordChangeOtpValidation,
    verifyPasswordChangeValidation,
    deleteAccountValidation,
    fcmTokenValidation
};