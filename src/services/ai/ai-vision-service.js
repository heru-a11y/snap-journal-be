import aiClient from "./ai-client.js";
import { AI_PROMPTS, FALLBACKS, EMOTIONS } from "../../constants/ai-constants.js";
import { logger } from "../../applications/logging.js";

const analyzeVideo = async (fileInput) => {
    logger.info("[AI Vision] Menyiapkan analisis video...");

    if (!fileInput) {
        logger.warn("[AI Vision] Input file kosong.");
        return FALLBACKS.VISION;
    }

    try {
        let videoData;
        let mimeType = "video/webm";

        const filePart = {
            inlineData: {
                data: videoData.toString("base64"),
                mimeType: mimeType
            }
        };

        logger.info("[AI Vision] Mengirim data video ke Gemini 3...");
        const analysis = await aiClient.generateJSON([AI_PROMPTS.VISION_ANALYSIS, filePart], FALLBACKS.VISION);
        
        logger.info(`[AI Vision] Hasil AI: ${JSON.stringify(analysis)}`);

        const validEmotions = Object.values(EMOTIONS);
        let rawEmotion = analysis.emotion || EMOTIONS.CALM;
        let finalEmotion = rawEmotion.charAt(0).toUpperCase() + rawEmotion.slice(1).toLowerCase();

        if (!validEmotions.includes(finalEmotion)) finalEmotion = EMOTIONS.CALM;

        return {
            emotion: finalEmotion,
            expression: analysis.expression || FALLBACKS.VISION.expression,
            confidence: analysis.confidence || FALLBACKS.VISION.confidence
        };
    } catch (error) {
        logger.error(`[AI Vision] Error Kritikal: ${error.message}`);
        return FALLBACKS.VISION;
    }
};

export default { analyzeVideo };