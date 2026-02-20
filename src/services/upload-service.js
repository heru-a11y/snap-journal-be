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

const uploadProfilePicture = async (user, file) => {
    if (!file) {
        throw new ResponseError(400, "File foto profil wajib ada.");
    }

    try {
        const fileBuffer = await sharp(file.buffer)
            .resize(500, 500, { fit: 'cover' }) 
            .jpeg({ quality: 80, mozjpeg: true }) 
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

const uploadEditorImage = async (user, file) => {
    if (!file) return null;

    try {
        const timestamp = Date.now();
        const cleanName = file.originalname.replace(/\.[^/.]+$/, "").replace(/\s+/g, '-');
        file.originalname = `${timestamp}-${cleanName}.jpg`;

        const fileBuffer = await sharp(file.buffer)
            .resize({ width: 1080, withoutEnlargement: true })
            .jpeg({ quality: 80, mozjpeg: true })
            .toBuffer();

        file.buffer = fileBuffer;
        file.mimetype = 'image/jpeg';

        const folder = `journals/${user.uid}/content-images`;
        const imageUrl = await uploadToGCS(file, folder);

        return { url: imageUrl };
    } catch (error) {
        throw new ResponseError(500, `Gagal upload gambar editor: ${error.message}`);
    }
};

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
                .audioCodec('aac')
                .audioBitrate('128k')
                .format('mp4')
                .outputOptions([
                    '-preset veryfast', 
                    '-crf 28',          
                    '-movflags +faststart',
                    '-pix_fmt yuv420p' 
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