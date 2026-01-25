import Favorite from "../models/favorite.js";
import mongoose from "mongoose";

//! toggle --->>>> BORRAR add y remove en rutas
export const toggleFavorite = async (req, res) => {
  try {
    //* prioridad al ID de la URL en DELETE (el del boty si es POST)
    const targetId = req.params.id || req.body.targetId;
    const { targetType } = req.body; //! sólo para POST
    const userId = req.user._id;

    if (!targetId) {
      return res.status(400).json({ message: "ID del objetivo no proporcionado" });
    }

    //* buscar por si existe
    const existing = await Favorite.findOne({ user: userId, targetId });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return res.status(200).json({ 
        message: "Eliminado de favoritos", 
        isFavorite: false 
      });
    }

    //! targetType obligatorio al crear
    if (!targetType) {
      return res.status(400).json({ message: "Tipo de objetivo (targetType) requerido para añadir" });
    }

    const newFav = new Favorite({ 
      user: userId, 
      targetId, 
      targetType: targetType.toLowerCase()
    });

    await newFav.save();
    res.status(201).json({ 
      message: "Añadido a favoritos", 
      isFavorite: true 
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: "Error al procesar favorito", 
      error: error.message 
    });
  }
};

//* get TODOS GET /api/v1/favorites
export const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id }).populate("targetId");
    
    //! fallo de los "no disponible"
    const validFavorites = favorites.filter(f => f.targetId !== null);
    const idsToClean = favorites.filter(f => f.targetId === null).map(f => f._id); //* limpiar de la db por si acaso lo que ya no valen

    if (idsToClean.length > 0) {
          await Favorite.deleteMany({ _id: { $in: idsToClean } });
          console.log(`Se han limpiado ${idsToClean.length} favoritos huérfanos.`);
        }

    res.status(200).json(validFavorites);
    } catch (error) {
    res.status(500).json({ message: "Error al obtener favoritos" });
    }
};


//* check estado GET /api/v1/favorites/check/:targetId

export const checkFavoriteStatus = async (req, res) => {
  try {

    const { id } = req.params; 


    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ isFavorite: false, message: "ID no válido" });
    }


    const exists = await Favorite.findOne({ 
      user: req.user._id, 
      targetId: new mongoose.Types.ObjectId(id) 
    });


    res.status(200).json({ isFavorite: !!exists });
  } catch (error) {
   
    console.error("Error en checkFavoriteStatus:", error.message);
    res.status(500).json({ isFavorite: false, error: error.message });
  }
};