import { ResponseError } from "../error/response-error.js";

const VERIFIED_MESSAGES = {
    id: {
        UNAUTHORIZED: "Unauthorized",
        UNVERIFIED: "Email Anda belum diverifikasi. Silakan cek inbox email Anda."
    },
    en: {
        UNAUTHORIZED: "Unauthorized",
        UNVERIFIED: "Your email has not been verified. Please check your email inbox."
    }
};

const verifiedMiddleware = (req, res, next) => {
    const user = req.user;
    const lang = req.lang || 'id';

    if (!user) {
        next(new ResponseError(401, VERIFIED_MESSAGES[lang].UNAUTHORIZED));
        return;
    }

    if (user.email_verified) {
        next();
    } else {
        next(new ResponseError(403, VERIFIED_MESSAGES[lang].UNVERIFIED));
    }
};

export { verifiedMiddleware };