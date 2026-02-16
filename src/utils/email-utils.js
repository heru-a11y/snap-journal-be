import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Helper untuk membaca template HTML dan mengganti variabel
 * @param {string} templateName - Nama file template (misal: "verification-email.html")
 * @param {object} data - Data key-value untuk replace variable {{key}}
 */
export const getHtmlTemplate = (templateName, data) => {
    const templatePath = path.join(__dirname, "../templates/emails", templateName);
    
    try {
        let htmlContent = fs.readFileSync(templatePath, "utf8");
        
        Object.keys(data).forEach((key) => {
            const regex = new RegExp(`{{${key}}}`, "g");
            htmlContent = htmlContent.replace(regex, data[key]);
        });

        return htmlContent;
    } catch (error) {
        console.error(`[Email Utils] Gagal membaca template: ${templateName}`, error);
        throw error;
    }
};