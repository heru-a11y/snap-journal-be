import aiClient from "./ai-client.js";
import { AI_INSTRUCTIONS, AI_PROMPTS } from "../../constants/ai-constants.js";
import { ResponseError } from "../../error/response-error.js";
import { aiFormat } from "../../utils/textFormatter.js";

const enhanceJournalText = async (request, lang = 'id') => {
    const { text, instruction } = request;
    
    const errorMsg = lang === 'en' ? "Journal text is required." : "Teks jurnal wajib diisi.";
    if (!text) throw new ResponseError(400, errorMsg);

    const systemInstruction = AI_PROMPTS.TEXT_ENHANCEMENT(instruction, lang);
    const textLabel = lang === 'en' ? 'Original Text' : 'Teks Asli';
    const prompt = `${systemInstruction}\n\n---\n${textLabel}: "${text}"\n---`;

    const aiOutputText = await aiClient.generateText(prompt, lang);
    return {
        original_text: text,
        enhanced_text: aiFormat(aiOutputText),
        instruction: instruction || AI_INSTRUCTIONS.GENERAL
    };
};

export default { enhanceJournalText };