import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import fs from "fs";
import csv from "csv-parser";


import User from "../src/api/v1/models/user.js";
import Group from "../src/api/v1/models/group.js";
import Product from "../src/api/v1/models/product.js";
import Message from "../src/api/v1/models/message.js";
import Conversation from "../src/api/v1/models/conversation.js";

dotenv.config();

const readCSV = (path) => {
  const results = [];
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(path)) resolve([]);
        fs.createReadStream(path)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => resolve(results))
        .on("error", (err) => reject(err));
  });
};

const clearDB = async () => {
  console.log("Limpiando base de datos...");
            await User.deleteMany({});
            await Group.deleteMany({});
            await Product.deleteMany({});
            await Message.deleteMany({});
            await Conversation.deleteMany({});
};

const seed = async () => {
  try {
        await mongoose.connect(process.env.DB_URL);

        await clearDB();


        //*  TODOS LOS USUARIOS DEL SEED LLEVAN SIEMPRE LA CONTRASEÑA 123456 <<<<<<<<<<<
    const passwordHash = await bcrypt.hash("123456", 10);

    
    
    //! CREAR USUARIOS
    
    
     const usersCSV = await readCSV("./seeds/users.csv");

     const usersToInsert = usersCSV.map(u => ({
            ...u,
            password: passwordHash, //* tienen que llevar mismo hash
            role: u.role || "user",
            groups: [],
            moderatorInGroups: []
            }));

     const usersCreated = await User.insertMany(
        usersCSV.map(u => {
            //* controlar las mayúsculas
            return { 
            ...u, 
            email: u.email.toLowerCase().trim(),
            password: passwordHash,
            locationLat: String(u.locationLat),
            locationLng: String(u.locationLng)
            };
        })
        );
    
    console.log(`${usersCreated.length} Usuarios creados.`);



    //! CREAR GRUPOS
    
    
    const groupsCSV = await readCSV("./seeds/groups.csv");
    const groupsToInsert = groupsCSV.map(g => {
    
        const creator = usersCreated.find(u => u.name === g.creatorName);
      return {
            ...g,
            creator: creator?._id,
            isPrivate: g.isPrivate === "true",
            members: creator ? [{ user: creator._id, role: "moderator" }] : []
      };
    }).filter(g => g.creator);

    const groupsCreated = await Group.insertMany(groupsToInsert);
    console.log(`${groupsCreated.length} Grupos creados.`);





    //! CREAR PRODUCTOS
        const productsCSV = await readCSV("./seeds/products.csv");
        const productsToInsert = productsCSV.map(p => {
            //* trimar nombres
            const owner = usersCreated.find(u => u.name.trim() === p.ownerName.trim());
            const group = groupsCreated.find(g => g.name.trim() === p.groupName.trim());

            if (!owner) {
                console.warn(`No se encontró dueño para el producto: ${p.name}`);
            }

            return {
                ...p,
                owner: owner?._id,
                group: group?._id || null,
                isPublic: p.isPublic === "true",
                quantity: Number(p.quantity),
                //*pega loc del dueño
                locationName: owner?.locationName || "",
                locationLat: owner?.locationLat || "",
                locationLng: owner?.locationLng || ""
            };
        }).filter(p => p.owner && p.locationLat !== ""); //* por si alguno pasa sin coordenadas
        await Product.insertMany(productsToInsert);
        console.log(`${productsToInsert.length} Productos creados con ubicación.`);



    //! RELLENAR MENSAJES DE GRUPO
        const messages = [];

        for (const group of groupsCreated) {
        const groupConversation = new Conversation({
            type: 'group',
            group: group._id,
            participants: group.members.map(m => m.user)
        });
        
            await groupConversation.save();
                messages.push({
                sender: group.creator,
                group: group._id,
                content: `Bienvenidos al grupo ${group.name}. Gracias por empezar a compartir.`
        });
        }
        
        await Message.insertMany(messages);
        console.log(`${messages.length} Mensajes de bienvenida generados.`);

        console.log("\n SEED COMPLETADO");
        process.exit(0);
    } catch (error) {
        console.error("Error en el seed:", error);
        process.exit(1);
    }
    };

seed();