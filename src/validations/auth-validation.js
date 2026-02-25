import Joi from "joi";

const registerUserValidation = (lang = 'id') => Joi.object({
    name: Joi.string().min(5).max(100).required().messages({
        'string.min': lang === 'en' ? 'Name minimum 5 characters' : 'Nama minimal 5 karakter',
        'string.max': lang === 'en' ? 'Name maximum 100 characters' : 'Nama maksimal 100 karakter',
        'any.required': lang === 'en' ? 'Name is required' : 'Nama wajib diisi'
    }),
    email: Joi.string().max(100).email().required().messages({
        'string.email': lang === 'en' ? 'Invalid email format' : 'Format email tidak valid',
        'any.required': lang === 'en' ? 'Email is required' : 'Email wajib diisi'
    }),
    password: Joi.string().min(6).max(100).required().messages({
        'string.min': lang === 'en' ? 'Password minimum 6 characters' : 'Password minimal 6 karakter',
        'any.required': lang === 'en' ? 'Password is required' : 'Password wajib diisi'
    })
});

const loginUserValidation = (lang = 'id') => Joi.object({
    email: Joi.string().max(100).email().required().messages({
        'string.email': lang === 'en' ? 'Invalid email format' : 'Format email tidak valid',
        'any.required': lang === 'en' ? 'Email is required' : 'Email wajib diisi'
    }),
    password: Joi.string().min(6).max(100).required().messages({
        'string.min': lang === 'en' ? 'Password minimum 6 characters' : 'Password minimal 6 karakter',
        'any.required': lang === 'en' ? 'Password is required' : 'Password wajib diisi'
    })
});

const verifyOtpValidation = (lang = 'id') => Joi.object({
    email: Joi.string().max(100).email().required().messages({
        'string.email': lang === 'en' ? 'Invalid email format' : 'Format email tidak valid',
        'any.required': lang === 'en' ? 'Email is required' : 'Email wajib diisi'
    }),
    otp: Joi.string().length(4).required().messages({
        'string.length': lang === 'en' ? 'OTP code must be 4 digits' : 'Kode OTP harus 4 digit',
        'any.required': lang === 'en' ? 'OTP code is required' : 'Kode OTP wajib diisi'
    })
});

const sendOtpValidation = (lang = 'id') => Joi.object({
    email: Joi.string().max(100).email().required().messages({
        'string.email': lang === 'en' ? 'Invalid email format' : 'Format email tidak valid',
        'any.required': lang === 'en' ? 'Email is required' : 'Email wajib diisi'
    })
});

const forgotPasswordValidation = (lang = 'id') => Joi.object({
    email: Joi.string().max(100).email().required().messages({
        'string.email': lang === 'en' ? 'Invalid email format' : 'Format email tidak valid',
        'any.required': lang === 'en' ? 'Email is required' : 'Email wajib diisi'
    })
});

const verifyResetOtpValidation = (lang = 'id') => Joi.object({
    email: Joi.string().max(100).email().required().messages({
        'string.email': lang === 'en' ? 'Invalid email format' : 'Format email tidak valid',
        'any.required': lang === 'en' ? 'Email is required' : 'Email wajib diisi'
    }),
    otp: Joi.string().length(4).required().messages({
        'string.length': lang === 'en' ? 'OTP code must be 4 digits' : 'Kode OTP harus 4 digit',
        'any.required': lang === 'en' ? 'OTP code is required' : 'Kode OTP wajib diisi'
    })
});

const resetPasswordValidation = (lang = 'id') => Joi.object({
    email: Joi.string().max(100).email().required().messages({
        'string.email': lang === 'en' ? 'Invalid email format' : 'Format email tidak valid',
        'any.required': lang === 'en' ? 'Email is required' : 'Email wajib diisi'
    }),
    otp: Joi.string().length(4).required().messages({
        'string.length': lang === 'en' ? 'OTP code must be 4 digits' : 'Kode OTP harus 4 digit',
        'any.required': lang === 'en' ? 'OTP code is required' : 'Kode OTP wajib diisi'
    }),
    password: Joi.string().min(6).max(100).required().messages({
        'string.min': lang === 'en' ? 'Password minimum 6 characters' : 'Password minimal 6 karakter',
        'any.required': lang === 'en' ? 'Password is required' : 'Password wajib diisi'
    }),
    password_confirmation: Joi.any().valid(Joi.ref('password')).required().messages({
        "any.only": lang === 'en' ? "Password confirmation does not match" : "Konfirmasi password tidak cocok"
    })
});

export {
    registerUserValidation,
    loginUserValidation,
    verifyOtpValidation, 
    sendOtpValidation,   
    forgotPasswordValidation,
    verifyResetOtpValidation,
    resetPasswordValidation
}