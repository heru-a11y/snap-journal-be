import Joi from "joi";

const createFeelingValidation = Joi.object({
    mood: Joi.string()
        .valid("Happy", "Calm", "Sad", "Tired", "Angry")
        .required()
        .messages({
            'any.only': 'Mood harus salah satu dari: Happy, Calm, Sad, Tired, Angry',
            'any.required': 'Mood wajib dipilih'
        })
});

export { createFeelingValidation };