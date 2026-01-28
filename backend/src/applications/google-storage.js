import { Storage } from "@google-cloud/storage";
import path from "path";
import { ResponseError } from "../error/response-error.js";

const storage = new Storage({
    keyFilename: path.resolve(process.env.FIREBASE_CREDENTIALS), 
});

const bucketName = process.env.FIREBASE_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

const uploadToGCS = (file, folder) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new ResponseError(400, "File wajib diupload."));
        }

        const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
        const destination = `${folder}/${fileName}`;
        
        const blob = bucket.file(destination);
        
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: file.mimetype,
            },
        });

        blobStream.on('error', (err) => {
            console.error("GCS Upload Error:", err);
            reject(new ResponseError(500, `Gagal upload ke storage: ${err.message}`));
        });

        blobStream.on('finish', async () => {            
            try {
                await blob.makePublic(); 
                
                const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
                resolve(publicUrl);
            } catch (error) {
                console.error("Gagal set public permission:", error);
                reject(new ResponseError(500, `Gagal setting permission file: ${error.message}`));
            }
        });

        blobStream.end(file.buffer);
    });
};

const deleteFromGCS = async (fileUrl) => {
    if (!fileUrl) return;

    try {
        const prefix = `https://storage.googleapis.com/${bucketName}/`;
        
        if (!fileUrl.startsWith(prefix)) {
            console.warn(`URL tidak valid atau bukan dari bucket ini: ${fileUrl}`);
            return;
        }

        const filePath = fileUrl.replace(prefix, '');

        await bucket.file(filePath).delete();

    } catch (error) {
        if (error.code === 404) {
            console.warn(`File GCS tidak ditemukan (skip): ${fileUrl}`);
        } else {
            console.error(`Gagal menghapus file GCS: ${error.message}`);
        }
    }
};

const getGcsUrl = (path) => {
    if (!path) return null;

    const cleanPath = path.replace(/^\/+/, '');
    const bucketName = process.env.FIREBASE_BUCKET_NAME; 

    return `https://storage.googleapis.com/${bucketName}/${cleanPath}`;
};

export {
    uploadToGCS,
    deleteFromGCS,
    getGcsUrl
}