import deleteService from "../services/delete-service.js";

const removeFile = async (req, res, next) => {
    try {
        const user = req.user;
        const { url } = req.body;

        if (!url) {
            throw new Error("URL file wajib disertakan");
        }

        const result = await deleteService.removeFile(user, url);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

export default {
    removeFile
};