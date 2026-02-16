import { uploadToGCS } from "../applications/google-storage.js";
import { ResponseError } from "../error/response-error.js";
import sharp from "sharp"; 
import ffmpeg from "fluent-ffmpeg";
import tmp from "tmp";
import fs from "fs";

const setUniqueFilename = (file) => {
    const timestamp = Date.now();
    const cleanName = file.originalname.replace(/\s+/g, '-');
    file.originalname = `${timestamp}-${cleanName}`;
    return file;
};

/**
 * Service untuk Upload Foto Profil
 * Path: users/{uid}/profile.jpg
 */
const uploadProfilePicture = async (user, file) => {
    if (!file) {
        throw new ResponseError(400, "File foto profil wajib ada.");
    }

    try {
        const fileBuffer = await sharp(file.buffer)
            .resize(500, 500, { fit: 'cover' }) 
            .jpeg({ quality: 80 })
            .toBuffer();
        
        file.buffer = fileBuffer;
        file.originalname = `profile-${Date.now()}.jpg`;

        const folder = `users/${user.uid}`;
        const imageUrl = await uploadToGCS(file, folder);

        return imageUrl;
    } catch (error) {
        throw new ResponseError(500, `Gagal proses foto profil: ${error.message}`);
    }
};

/**
 * Service untuk Upload Foto Inline dengan Kompresi Otomatis
 */
const uploadEditorImage = async (user, file) => {
    if (!file) {
        throw new ResponseError(400, "File gambar wajib ada.");
    }

    try {
        setUniqueFilename(file);
        
        let fileBuffer = file.buffer;
        const limitSize = 2 * 1024 * 1024;

        if (file.size > limitSize) {
            fileBuffer = await sharp(file.buffer)
                .resize({ width: 2000, withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer();
            file.buffer = fileBuffer;
        }

        const folder = `journals/${user.uid}/photos`;
        const imageUrl = await uploadToGCS(file, folder);

        return {
            url: imageUrl
        };
    } catch (error) {
        throw new ResponseError(500, `Gagal proses/upload gambar: ${error.message}`);
    }
};

/**
 * Video dikompres
 */
const uploadJournalVideo = async (user, file) => {
    if (!file) return null;

    const tempInput = tmp.fileSync({ postfix: '.bin' });
    const tempOutput = tmp.fileSync({ postfix: '.mp4' });

    try {
        setUniqueFilename(file);
        const folder = `journals/${user.uid}/videos`;
        fs.writeFileSync(tempInput.name, file.buffer);

        return new Promise((resolve, reject) => {
            ffmpeg(tempInput.name)
                .videoCodec('libx264')
                .size('1280x720')
                .format('mp4')
                .outputOptions([
                    '-preset ultrafast', 
                    '-crf 28',           
                    '-movflags +faststart'
                ])
                .on('error', (err) => {
                    cleanup(tempInput, tempOutput);
                    reject(new ResponseError(500, `FFmpeg Transcoding Error: ${err.message}`));
                })
                .on('end', async () => {
                    try {
                        const videoBuffer = fs.readFileSync(tempOutput.name);
                        
                        if (videoBuffer.length === 0) {
                            throw new Error("FFmpeg produced an empty file.");
                        }

                        const videoUrl = await uploadToGCS({
                            ...file,
                            buffer: videoBuffer,
                            mimetype: 'video/mp4'
                        }, folder);

                        cleanup(tempInput, tempOutput);
                        resolve(videoUrl);
                    } catch (error) {
                        cleanup(tempInput, tempOutput);
                        reject(error);
                    }
                })
                .save(tempOutput.name);
        });

    } catch (error) {
        cleanup(tempInput, tempOutput);
        throw new ResponseError(500, `Internal Video Service Error: ${error.message}`);
    }
};

// Helper untuk membersihkan file agar tidak memenuhi storage Docker
function cleanup(inFiles, outFiles) {
    try {
        if (inFiles && fs.existsSync(inFiles.name)) inFiles.removeCallback();
        if (outFiles && fs.existsSync(outFiles.name)) outFiles.removeCallback();
    } catch (e) {
        console.error("Cleanup failed:", e.message);
    }
}

export default {
    uploadProfilePicture,
    uploadEditorImage,
    uploadJournalVideo
};