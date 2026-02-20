import uploadService from "../services/upload-service.js";

/**
 * Membersihkan string dari tag HTML
 */
export const stripHtmlTags = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, ' ')
               .replace(/&nbsp;/g, ' ')
               .replace(/\s+/g, ' ')
               .trim();
};

/**
 * Mengekstrak semua URL gambar GCS dari string HTML
 * @param {string} htmlString 
 * @returns {Array<string>} Array berisi URL gambar
 */
export const extractImageUrls = (htmlString) => {
    if (!htmlString) return [];

    const regex = /src="(https:\/\/storage\.googleapis\.com\/[^"]+)"/g;
    const urls = [];
    let match;

    while ((match = regex.exec(htmlString)) !== null) {
        urls.push(match[1]);
    }

    return urls;
};

/**
 * Helper: Upload array foto dan replace marker {{IMG_n}} di note
 * Digunakan untuk alur "Upload on Save" pada Rich Text Editor.
 */
export const processContentImages = async (user, noteContent, photoFiles) => {
    let updatedNote = noteContent || "";

    if (!photoFiles || photoFiles.length === 0) return updatedNote;

    const uploadPromises = photoFiles.map((file) => 
        uploadService.uploadEditorImage(user, file)
    );

    const uploadedImages = await Promise.all(uploadPromises);

    uploadedImages.forEach((imgData, index) => {
        const marker = `{{IMG_${index}}}`;
        if (imgData && imgData.url) {
            updatedNote = updatedNote.replace(marker, `<img src="${imgData.url}" alt="image-${index}" />`);
        }
    });

    return updatedNote;
};