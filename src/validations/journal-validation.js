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
    }),
    images: Joi.array().items(Joi.string()).max(3).messages({
        'array.max': 'Maksimal 3 foto yang diperbolehkan'
    }).optional(),
    is_favorite: Joi.boolean().optional(),
    is_draft: Joi.boolean().optional(),
    video: Joi.any().optional()
});

const updateJournalValidation = Joi.object({
    title: Joi.string().max(255).optional().allow('').messages({
        'string.base': 'Judul harus berupa teks',
        'string.max': 'Judul maksimal 255 karakter',
    }),
    note: Joi.string().optional().allow('').messages({
        'string.base': 'Catatan harus berupa teks'
    }),
    images: Joi.array().items(Joi.string()).max(3).messages({
        'array.max': 'Maksimal 3 foto yang diperbolehkan'
    }).optional(),
    is_favorite: Joi.boolean().optional(),
    is_draft: Joi.boolean().optional(),
    video: Joi.any().optional()
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
    end_date: Joi.date().iso().optional(),
    category: Joi.string().valid('all', 'favorites', 'draft').optional(),
    keyword: Joi.string().allow('').optional()
});

const getPeriodicInsightValidation = Joi.object({
    start_date: Joi.date().iso().required().messages({
        'date.format': 'Format tanggal mulai salah, gunakan YYYY-MM-DD',
        'any.required': 'Tanggal mulai wajib diisi'
    }),
    end_date: Joi.date().iso().required().min(Joi.ref('start_date')).messages({
        'date.format': 'Format tanggal akhir salah, gunakan YYYY-MM-DD',
        'any.required': 'Tanggal akhir wajib diisi',
        'date.min': 'Tanggal akhir tidak boleh lebih kecil dari tanggal mulai'
    })
});

const favoriteJournalValidation = Joi.object({
    is_favorite: Joi.boolean().required().messages({
        'boolean.base': 'Status favorite harus berupa boolean (true/false)',
        'any.required': 'Status favorite wajib diisi'
    })
});

const draftJournalValidation = Joi.object({
    is_draft: Joi.boolean().required().messages({
        'boolean.base': 'Status draft harus berupa boolean (true/false)',
        'any.required': 'Status draft wajib diisi'
    })
});

export {
    createJournalValidation,
    updateJournalValidation,
    searchJournalValidation,
    getPeriodicInsightValidation,
    favoriteJournalValidation,
    draftJournalValidation
};