import aiClient from "./ai-client.js";
import { AI_PROMPTS } from "./ai-constants.js";
import { ResponseError } from "../../error/response-error.js";
import { aiFormat } from "../../utils/textFormatter.js";

const chatWithJournalContext = async (journalData, userMessage) => {
    if (!userMessage) {
        throw new ResponseError(400, "Pesan pertanyaan wajib diisi.");
    }

    const prompt = AI_PROMPTS.CHAT_CONTEXT(journalData, userMessage);
    const aiReplyText = await aiClient.generateText(prompt);
    
    return aiFormat(aiReplyText);
};

export default { chatWithJournalContext };