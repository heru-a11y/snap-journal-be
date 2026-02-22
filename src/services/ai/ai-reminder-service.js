import aiClient from "./ai-client.js";
import { FALLBACKS } from "./ai-constants.js";

const generatePersonalizedReminder = async (lastJournal, userName) => {
    const prompt = `Tugas: Buat notifikasi push pengingat jurnal untuk ${userName}. Konteks: ${lastJournal.title}. Output JSON {"title": "", "body": ""}`;

    return await aiClient.generateJSON(prompt, FALLBACKS.REMINDER(userName));
};

export default { generatePersonalizedReminder };