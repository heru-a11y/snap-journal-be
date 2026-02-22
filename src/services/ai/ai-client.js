import provider from "../../applications/gemini.js";
import { ResponseError } from "../../error/response-error.js";
import { logger } from "../../applications/logging.js";

const generateText = async (prompt) => {
    if (!provider.isConfigured) {
        throw new ResponseError(500, "AI provider tidak tersedia.");
    }

    try {
        return await provider.generateText(prompt);
    } catch (error) {
        logger.error(`AI generateText Error: ${error.message}`);
        throw new ResponseError(500, "Gagal memproses teks via AI.");
    }
};

const generateJSON = async (prompt, fallback) => {
    if (!provider.isConfigured) {
        return fallback;
    }

    try {
        const rawJson = await provider.generateJSON(prompt);
        const cleanJson = rawJson.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        logger.error(`AI generateJSON Error: ${error.message} | Raw: ${rawJson}`);
        return fallback;
    }
};

export default { generateText, generateJSON };