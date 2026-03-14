import { deleteFromGCS } from "../applications/google-storage.js";
import { ResponseError } from "../error/response-error.js";

const removeFile = async (user, fileUrl) => {
    if (!fileUrl) return;

    const isJournalFile = fileUrl.includes(`journals/${user.uid}/`);
    const isProfileFile = fileUrl.includes(`users/${user.uid}/`);

    if (!isJournalFile && !isProfileFile) {
        throw new ResponseError(403, "Anda tidak memiliki izin untuk menghapus file ini.");
    }

    try {
        await deleteFromGCS(fileUrl);
        return { message: "File berhasil dihapus" };
    } catch (error) {
        throw new ResponseError(500, `Gagal menghapus file: ${error.message}`);
    }
};

export default {
    removeFile
};