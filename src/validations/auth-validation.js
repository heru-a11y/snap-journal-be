import Joi from "joi";

const registerUserValidation = Joi.object({
    name: Joi.string().min(5).max(100).required(),
    email: Joi.string().max(100).email().required(),
    password: Joi.string().min(6).max(100).required()
});

const loginUserValidation = Joi.object({
    email: Joi.string().max(100).email().required(),
    password: Joi.string().min(6).max(100).required()
});

const verifyOtpValidation = Joi.object({
    email: Joi.string().max(100).email().required().messages({
        'string.email': 'Format email tidak valid',
        'any.required': 'Email wajib diisi'
    }),
    otp: Joi.string().length(4).required().messages({
        'string.length': 'Kode OTP harus 4 digit',
        'any.required': 'Kode OTP wajib diisi'
    })
});

const sendOtpValidation = Joi.object({
    email: Joi.string().max(100).email().required().messages({
        'string.email': 'Format email tidak valid',
        'any.required': 'Email wajib diisi'
    })
});

const forgotPasswordValidation = Joi.object({
    email: Joi.string().max(100).email().required()
});

const verifyResetOtpValidation = Joi.object({
    email: Joi.string().max(100).email().required(),
    otp: Joi.string().length(4).required().messages({
        'string.length': 'Kode OTP harus 4 digit',
        'any.required': 'Kode OTP wajib diisi'
    })
});

const resetPasswordValidation = Joi.object({
    email: Joi.string().max(100).email().required(),
    otp: Joi.string().length(4).required(),
    password: Joi.string().min(6).max(100).required(),
    password_confirmation: Joi.any().valid(Joi.ref('password')).required().messages({
        "any.only": "Konfirmasi password tidak cocok"
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