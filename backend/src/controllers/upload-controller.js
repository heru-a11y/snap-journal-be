import uploadService from "../services/upload-service.js";

const uploadEditorImage = async (req, res, next) => {
    try {
        const user = req.user;
        const files = req.files || {};
        const imageFileArray = files['image'] || files['upload'];
        const imageFile = imageFileArray ? imageFileArray[0] : null;

        if (!imageFile) {
            throw new Error("File gambar wajib ada. (Key: 'image')");
        }

        const result = await uploadService.uploadEditorImage(user, imageFile);

        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
};

export default {
    uploadEditorImage
};