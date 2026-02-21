const extractImagesFromHtml = (htmlString) => {
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    const urls = [];
    let match;
    while ((match = imgRegex.exec(htmlString)) !== null) {
        urls.push(match[1]);
    }
    return urls;
};

export default { extractImagesFromHtml };