import { admin } from "../applications/firebase.js";

const AUTH_MESSAGES = {
    id: {
        UNAUTHORIZED: "Unauthorized",
        REVOKED: "Unauthorized (Token Revoked/Logout)",
        INVALID: "Unauthorized (Invalid Token)"
    },
    en: {
        UNAUTHORIZED: "Unauthorized",
        REVOKED: "Unauthorized (Token Revoked/Logout)",
        INVALID: "Unauthorized (Invalid Token)"
    }
};

const authMiddleware = async (req, res, next) => {
    const lang = req.lang || 'id';
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ errors: AUTH_MESSAGES[lang].UNAUTHORIZED }).end();
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token, true);
        req.user = decodedToken;
        next();
    } catch (error) {
        if (error.code === 'auth/id-token-revoked') {
            res.status(401).json({ errors: AUTH_MESSAGES[lang].REVOKED }).end();
        } else {
            res.status(401).json({ errors: AUTH_MESSAGES[lang].INVALID }).end();
        }
    }
};

export { authMiddleware };