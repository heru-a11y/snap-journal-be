import { validate } from "../validations/validation.js";

const runValidation = (schemaOrFactory) => {
    return (req, res, next) => {
        try {
            const lang = req.lang || 'id';
            const schema = typeof schemaOrFactory === 'function' ? schemaOrFactory(lang) : schemaOrFactory;
            const validatedData = validate(schema, req.body);
            req.body = validatedData;
            next();
        } catch (e) {
            next(e);
        }
    }
}

const runQueryValidation = (schemaOrFactory) => {
    return (req, res, next) => {
        try {
            const lang = req.lang || 'id';
            const schema = typeof schemaOrFactory === 'function' ? schemaOrFactory(lang) : schemaOrFactory;
            const validatedData = validate(schema, req.query);
            req.query = validatedData;
            next();
        } catch (e) {
            next(e);
        }
    }
}

export { runValidation, runQueryValidation };