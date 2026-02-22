import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "./logging.js";

const apiKey = process.env.GEMINI_API_KEY;

let model = null;

if (apiKey && apiKey.trim() !== "") {
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    logger.info("AI Provider: Gemini 3 Flash Preview berhasil dimuat.");
} else {
    logger.error("AI Provider Error: GEMINI_API_KEY kosong atau tidak ditemukan.");
}

const generateText = async (prompt) => {
    if (!model) throw new Error("Model AI tidak tersedia.");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};

const generateJSON = async (prompt) => {
    if (!model) return "{}";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.replace(/```json|```/g, "").trim();
};

export default { generateText, generateJSON, isConfigured: !!model };