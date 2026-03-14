import aiClient from "./ai-client.js";
import { AI_PROMPTS } from "../../constants/ai-constants.js";
import { ResponseError } from "../../error/response-error.js";
import { aiFormat } from "../../utils/textFormatter.js";

const chatWithJournalContext = async (journalData, userMessage, lang = 'id') => {
    const errorMsg = lang === 'en' ? "Question message is required." : "Pesan pertanyaan wajib diisi.";
    if (!userMessage) {
        throw new ResponseError(400, errorMsg);
    }

    const prompt = AI_PROMPTS.CHAT_CONTEXT(journalData, userMessage, lang);
    const aiReplyText = await aiClient.generateText(prompt, lang);
    
    return aiFormat(aiReplyText);
};

export default { chatWithJournalContext };