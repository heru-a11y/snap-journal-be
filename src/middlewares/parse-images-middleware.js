export const parseImagesMiddleware = (req, res, next) => {
    if (req.body.images && !Array.isArray(req.body.images)) {
        try {
            const parsed = JSON.parse(req.body.images);
            req.body.images = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
            if (typeof req.body.images === 'string' && req.body.images.includes(',')) {
                req.body.images = req.body.images.split(',').map(url => url.trim());
            } else {
                req.body.images = [req.body.images];
            }
        }
    }
    next();
};