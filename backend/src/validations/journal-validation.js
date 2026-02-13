import Joi from "joi";

const createJournalValidation = Joi.object({
    title: Joi.string().max(255).required().messages({
        'string.base': 'Judul harus berupa teks',
        'string.max': 'Judul maksimal 255 karakter',
        'any.required': 'Judul wajib diisi',
        'string.empty': 'Judul tidak boleh kosong'
    }),

    note: Joi.string().optional().allow('').messages({
        'string.base': 'Catatan harus berupa teks'
    })
});

const updateJournalValidation = Joi.object({
    title: Joi.string().max(255).optional().messages({
        'string.base': 'Judul harus berupa teks',
        'string.max': 'Judul maksimal 255 karakter',
        'string.empty': 'Judul tidak boleh kosong'
    }),
    
    note: Joi.string().optional().allow('').messages({
        'string.base': 'Catatan harus berupa teks'
    })
});

const searchJournalValidation = Joi.object({
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).max(100).positive().default(10),
    month: Joi.number().min(1).max(12).optional(),
    year: Joi.number().min(2000).max(2100).optional(),

    date: Joi.date().iso().optional().messages({
        'date.format': 'Format tanggal salah, gunakan YYYY-MM-DD'
    }),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional()
});

export {
    createJournalValidation,
    updateJournalValidation,
    searchJournalValidation
};