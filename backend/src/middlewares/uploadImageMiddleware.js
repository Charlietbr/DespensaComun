import cloudinary from "../config/cloudinaryConfig.js";
import multer from "multer";
import streamifier from "streamifier";

const storage = multer.memoryStorage();
const upload = multer({storage});
export const uploadImage = upload.single("image");

export const uploadToCloudinary = (req, res, next) => {
    if (req.file) {
        const stream = cloudinary.uploader.upload_stream(
            {folder: "users"},
            (error, result) => {
                if (error) {
                    console.error("Error de cloudinary: ", error);
                    return res.status(500).json({message:"Error al subir la imagen a Cloudinary:", error});
                }
                req.body.image = {url: result.secure_url, public_id: result.public_id};
                next();
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
    } else {
        next();
    }
};

