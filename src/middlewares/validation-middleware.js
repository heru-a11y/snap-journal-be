import { validate } from "../validations/validation.js";

// Untuk Validasi Body (POST/PUT)
const runValidation = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = validate(schema, req.body);
            req.body = validatedData;
            next();
        } catch (e) {
            next(e);
        }
    }
}

// Untuk Validasi Query Params (GET)
const runQueryValidation = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = validate(schema, req.query);
            req.query = validatedData;
            next();
        } catch (e) {
            next(e);
        }
    }
}

export { runValidation, runQueryValidation };