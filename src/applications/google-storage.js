import { bucket } from "./firebase.js"; 
import { ResponseError } from "../error/response-error.js";

const bucketName = process.env.GOOGLE_BUCKET_NAME;

/**
 * Upload ke GCS (Mendukung Buffer & Stream)
 */
const uploadToGCS = (file, folder) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new ResponseError(400, "File wajib diupload."));
        }

        const fileName = file.originalname || `${Date.now()}-file`;
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
                try {
                    await blob.makePublic(); 
                } catch (publicError) {
                    console.warn("Info: Gagal set public permission. Cek IAM Bucket.");
                }                
                const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
                console.log(`Upload sukses: ${publicUrl}`);
                resolve(publicUrl);
            } catch (error) {
                reject(new ResponseError(500, `Gagal finalize file: ${error.message}`));
            }
        });

        if (file.stream) {
            file.stream.pipe(blobStream);

            file.stream.on('error', (err) => {
                blobStream.destroy();
                reject(err);
            });

        } else if (file.buffer) {
            blobStream.end(file.buffer);
        } else {
            reject(new ResponseError(400, "Format data file tidak dikenali (No buffer/stream)."));
        }
    });
};

const deleteFromGCS = async (fileUrl) => {
    if (!fileUrl) return;
    try {
        const prefix = `https://storage.googleapis.com/${bucketName}/`;
        if (!fileUrl.startsWith(prefix)) return;

        const filePath = fileUrl.replace(prefix, '');
        await bucket.file(filePath).delete();
        console.log(`Berhasil menghapus file GCS: ${filePath}`);
    } catch (error) {
        if (error.code !== 404) {
            console.error(`Gagal menghapus file GCS: ${error.message}`);
        }
    }
};

const getGcsUrl = (path) => {
    if (!path) return null;
    const cleanPath = path.replace(/^\/+/, '');
    return `https://storage.googleapis.com/${bucketName}/${cleanPath}`;
};

export { uploadToGCS, deleteFromGCS, getGcsUrl };