import uploadService from "../upload-service.js";
import deleteService from "../delete-service.js";
import htmlParserUtil from "../../utils/html-parser-util.js";

const handleVideoUpload = async (user, videoFile) => {
    if (!videoFile) return null;
    return await uploadService.uploadJournalVideo(user, videoFile);
};

const handleVideoDelete = async (user, videoUrl) => {
    if (videoUrl) {
        await deleteService.removeFile(user, videoUrl);
    }
};

const handleEmbeddedImagesDelete = async (user, note) => {
    if (!note) return;
    
    const imageUrls = htmlParserUtil.extractImagesFromHtml(note);
    const deletePromises = imageUrls
        .filter(url => url.includes(`journals/${user.uid}/`))
        .map(url => deleteService.removeFile(user, url));

    await Promise.allSettled(deletePromises);
};

export default {
    handleVideoUpload,
    handleVideoDelete,
    handleEmbeddedImagesDelete
};