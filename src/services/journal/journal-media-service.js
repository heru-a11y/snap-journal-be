import uploadService from "../upload-service.js";
import deleteService from "../delete-service.js";

const handleVideoUpload = async (user, videoFile) => {
    if (!videoFile) return null;
    return await uploadService.uploadJournalVideo(user, videoFile);
};

const handleVideoDelete = async (user, videoUrl) => {
    if (videoUrl) {
        await deleteService.removeFile(user, videoUrl);
    }
};

const handleJournalImagesDelete = async (user, imageUrls) => {
    if (!imageUrls || !Array.isArray(imageUrls)) return;
    
    const deletePromises = imageUrls
        .filter(url => url.includes(`journals/${user.uid}/`))
        .map(url => deleteService.removeFile(user, url));

    await Promise.allSettled(deletePromises);
};

export default {
    handleVideoUpload,
    handleVideoDelete,
    handleJournalImagesDelete
};