import aiClient from "./ai-client.js";
import { AI_INSTRUCTIONS, AI_PROMPTS } from "../../constants/ai-constants.js";
import { ResponseError } from "../../error/response-error.js";
import { aiFormat } from "../../utils/textFormatter.js";

const enhanceJournalText = async (request) => {
    const { text, instruction } = request;
    if (!text) throw new ResponseError(400, "Teks jurnal wajib diisi.");

    const systemInstruction = AI_PROMPTS.TEXT_ENHANCEMENT[instruction] || AI_PROMPTS.TEXT_ENHANCEMENT[AI_INSTRUCTIONS.GENERAL];
    const prompt = `${systemInstruction}\n\n---\nTeks Asli: "${text}"\n---`;

    const aiOutputText = await aiClient.generateText(prompt);
    return {
        original_text: text,
        enhanced_text: aiFormat(aiOutputText),
        instruction: instruction || AI_INSTRUCTIONS.GENERAL
    };
};

export default { enhanceJournalText };