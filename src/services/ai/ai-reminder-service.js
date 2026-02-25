import aiClient from "./ai-client.js";
import { AI_PROMPTS, FALLBACKS } from "../../constants/ai-constants.js";

const generatePersonalizedReminder = async (lastJournal, userName, lang = 'id') => {
    const prompt = AI_PROMPTS.REMINDER(lastJournal, userName, lang);
    return await aiClient.generateJSON(prompt, FALLBACKS.REMINDER(userName)[lang], lang);
};

export default { generatePersonalizedReminder };