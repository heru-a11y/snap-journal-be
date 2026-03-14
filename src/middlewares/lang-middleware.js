export const langMiddleware = (req, res, next) => {
    const langHeader = req.headers['accept-language'];
    req.lang = langHeader && langHeader.startsWith('en') ? 'en' : 'id';
    next();
};