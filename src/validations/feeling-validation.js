import Joi from "joi";

const createFeelingValidation = (lang = 'id') => Joi.object({
    mood: Joi.string()
        .valid("Happy", "Calm", "Sad", "Tired", "Angry")
        .required()
        .messages({
            'any.only': lang === 'en' ? 'Mood must be one of: Happy, Calm, Sad, Tired, Angry' : 'Mood harus salah satu dari: Happy, Calm, Sad, Tired, Angry',
            'any.required': lang === 'en' ? 'Mood is required' : 'Mood wajib dipilih'
        })
});

export { createFeelingValidation };