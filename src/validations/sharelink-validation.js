import Joi from "joi";

const createShareLinkValidation = (lang = 'id') => Joi.object({
    journalId: Joi.string().required().messages({
        'string.base': lang === 'en' ? 'Journal ID must be a string' : 'Journal ID harus berupa string',
        'any.required': lang === 'en' ? 'Journal ID is required' : 'Journal ID wajib diisi',
        'string.empty': lang === 'en' ? 'Journal ID cannot be empty' : 'Journal ID tidak boleh kosong'
    }),

    shareType: Joi.string().valid('public', 'restricted').required().messages({
        'string.base': lang === 'en' ? 'Share type must be a string' : 'Tipe share harus berupa string',
        'any.only': lang === 'en' ? 'Share type must be public or restricted' : 'Tipe share harus public atau restricted',
        'any.required': lang === 'en' ? 'Share type is required' : 'Tipe share wajib diisi'
    }),

    expiresAt: Joi.date()
    .max(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    .optional()
    .messages({
        'date.base': lang === 'en' ? 'Expiration date must be a valid date' : 'Tanggal kedaluwarsa harus berupa tanggal yang valid',
        'date.max': lang === 'en' ? 'Expiration cannot exceed 30 days' : 'Tanggal kedaluwarsa maksimal 30 hari'
    })
});

const accessLinkValidation = (lang = 'id') => Joi.object({
    token: Joi.string().required().messages({
        'string.base': lang === 'en' ? 'Token must be a string' : 'Token harus berupa string',
        'any.required': lang === 'en' ? 'Token is required' : 'Token wajib diisi',
        'string.empty': lang === 'en' ? 'Token cannot be empty' : 'Token tidak boleh kosong'
    })
});

const requestAccessValidation = (lang = 'id') => Joi.object({
    token: Joi.string().required().messages({
        'string.base': lang === 'en' ? 'Token must be a string' : 'Token harus berupa string',
        'any.required': lang === 'en' ? 'Token is required' : 'Token wajib diisi',
        'string.empty': lang === 'en' ? 'Token cannot be empty' : 'Token tidak boleh kosong'
    })
});

const revokeShareLinkValidation = (lang = 'id') => Joi.object({
    token: Joi.string().required().messages({
        'string.base': lang === 'en' ? 'Token must be a string' : 'Token harus berupa string',
        'any.required': lang === 'en' ? 'Token is required' : 'Token wajib diisi',
        'string.empty': lang === 'en' ? 'Token cannot be empty' : 'Token tidak boleh kosong'
    })
});

const approveAccessValidation = (lang = 'id') => Joi.object({
    requestId: Joi.string().required().messages({
        'string.base': lang === 'en' ? 'Request ID must be a string' : 'Request ID harus berupa string',
        'any.required': lang === 'en' ? 'Request ID is required' : 'Request ID wajib diisi',
        'string.empty': lang === 'en' ? 'Request ID cannot be empty' : 'Request ID tidak boleh kosong'
    })
});

const denyAccessValidation = (lang = 'id') => Joi.object({
    requestId: Joi.string().required().messages({
        'string.base': lang === 'en' ? 'Request ID must be a string' : 'Request ID harus berupa string',
        'any.required': lang === 'en' ? 'Request ID is required' : 'Request ID wajib diisi',
        'string.empty': lang === 'en' ? 'Request ID cannot be empty' : 'Request ID tidak boleh kosong'
    })
});

export {
    createShareLinkValidation,
    accessLinkValidation,
    requestAccessValidation,
    revokeShareLinkValidation,
    approveAccessValidation,
    denyAccessValidation
};