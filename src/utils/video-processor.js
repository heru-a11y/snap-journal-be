import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import path from "path";
import { logger } from "../applications/logging.js";

const processVideoForAI = async (localPath) => {
    if (!localPath) {
        throw new Error("Local path file tidak ditemukan.");
    }

    const outPath = path.join("/tmp", `frame_${Date.now()}.jpg`);

    return new Promise((resolve, reject) => {
        ffmpeg(localPath)
            .screenshots({
                timestamps: ["00:00:01"],
                filename: path.basename(outPath),
                folder: path.dirname(outPath),
                size: "640x?"
            })
            .on("end", async () => {
                try {
                    const buffer = await fs.readFile(outPath);
                    const base64Data = buffer.toString("base64");
                    await fs.unlink(outPath).catch(() => {});
                    
                    resolve({
                        inlineData: {
                            data: base64Data,
                            mimeType: "image/jpeg"
                        }
                    });
                } catch (err) {
                    reject(err);
                }
            })
            .on("error", (err) => {
                logger.error(`FFmpeg Processing Error: ${err.message}`);
                reject(err);
            });
    });
};

export { processVideoForAI };