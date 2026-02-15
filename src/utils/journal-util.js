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