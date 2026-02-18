import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/user.js";
import { deleteFromCloudinary } from "../../../utils/deleteFromCloudinary.js";



//============================================================================================


export const registerUser = async (req, res) => {
  try {

    const { name, email, password, locationName, locationLat, locationLng, bio, profileImage } = req.body;
    

    if (!name || !email || !password || !locationName) {
      return res.status(400).json({ message: "Nombre, email, contraseña y población son necesarios." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Ya existe un usuario con ese email." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      locationName,
      locationLat: String(locationLat),
      locationLng: String(locationLng),
      bio: bio || "",
      profileImage: {
        url: profileImage?.url || "",
        public_id: profileImage?.public_id || ""
      }
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userSafe = newUser.toObject();
    delete userSafe.password;

    return res.status(201).json({
      message: "Usuario creado correctamente.",
      user: userSafe,
      token: token
    });

  } catch (error) {
    console.error("Error al crear usuario: ", error);
    return res.status(500).json({ message: "Error al crear usuario", error });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;


    if (req.user.id !== id && req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permiso." });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });


    const allowedUpdates = [
      "name", "email", "bio", "password", 
      "locationName", "locationLat", "locationLng"
    ];
    
    const updates = {};


    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });


    if (req.body.profileImage?.url) {
      if (user.profileImage?.public_id) {
        await deleteFromCloudinary(user.profileImage.public_id);
      }
      updates["profileImage.url"] = req.body.profileImage.url;
      updates["profileImage.public_id"] = req.body.profileImage.public_id;
    }

 
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");
    
    return res.status(200).json({ 
      message: "Usuario actualizado correctamente.", 
      user: updatedUser 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al actualizar." });
  }
};


export const updateUserOld = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id && req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para actualizar este usuario." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
//! la foto por separado
    const allowedUpdates = ["name", "email", "location", "bio", "password"];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key]) updates[key] = req.body[key];
    }

      if (req.body.profileImage?.url) {
        if (user.profileImage?.public_id) {
          await deleteFromCloudinary(user.profileImage.public_id);
        }

      updates["profileImage.url"] = req.body.profileImage.url;
    }

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");
    return res.status(200).json({ message: "Usuario actualizado correctamente.", user: updatedUser });
  } catch (error) {
    console.error("Error al actualizar usuario: ", error);
    return res.status(500).json({ message: "Error al actualizar usuario", error });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son obligatorios." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      message: "Acceso permitido.",
      token,
      user: userData,
    });

  } catch (error) {
    console.error("Error al acceder: ", error);
    return res.status(500).json({ message: "Error al acceder", error });
  }
};


export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    //* solo un admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permisos para cambiar roles." });
    }

    const validRoles = ["user", "groupAdmin", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Rol no válido." });
    }

    const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res.status(200).json({
      message: `Rol actualizado a '${role}' correctamente.`,
      user: updatedUser,
    });

  } catch (error) {
    console.error("Error al actualizar rol: ", error);
    return res.status(500).json({ message: "Error al actualizar rol de usuario", error });
  }
};




export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id && req.user.role !== "admin") {
      return res.status(403).json({message: "No tienes permiso para eliminar esta cuenta"});
    };

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({message: "Usuario no encontrado."});
    };

    //! eliminar imagen de cloudinary
    if (user.profileImage && user.profileImage.public_id) {
      await deleteFromCloudinary(user.profileImage.public_id);
    };

    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: "Usuario eliminado correctamente." });


  } catch (error) {
    console.error("Error al eliminar usuario: ", error);
    return res.status(500).json({message: "Error al eliminar usuario", error});    
  }
}; 



export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de usuario no válido." });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res.status(200).json(user);

  } catch (error) {
    console.error("Error al recuperar usuario:", error);
    return res.status(500).json({
      message: "Error al recuperar usuario",
      error: error.message || error
    });
  }
};




 export const getAllUsers = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({message: "Acceso denegado."});
    };

    const users = await User.find();
    return res.status(200).json(users);

  } catch (error) {
    console.error("Error al recuperar lista de usuarios: ", error);
    return res.status(500).json({message: "Error al recuperar lista de usuarios", error});    
  }
}; 
