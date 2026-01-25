import cloudinary from "../config/cloudinaryConfig.js";

export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Error al intentar eliminar la imagen de Cloudinary");
        throw error;
    }
};