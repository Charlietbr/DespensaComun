import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Conexión correcta a la base de datos.");

    } catch (error) {
        console.log("Ha fallado la conexión a la base de datos.");
    }
};

