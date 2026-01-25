import Product from "../models/product.js";
import { deleteFromCloudinary } from "../../../utils/deleteFromCloudinary.js";
import mongoose from "mongoose";



export const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category, 
      quantity, 
      unit, 
      estimatedHarvestDate, 
      isPublic,
      group,
      image,
      locationName,
      locationLat,
      locationLng 
    } = req.body;


    if (!name || !quantity) {
      return res.status(400).json({ message: "Es necesario indicar producto y cantidad." });
    }

    const newProduct = new Product({
      owner: req.user._id, 
      name,
      description,
      category: category ? category.toLowerCase() : "intercambio",
      quantity: Number(quantity),
      unit: unit ? unit.toLowerCase() : "kilos",
      estimatedHarvestDate,
      isPublic: isPublic === true || isPublic === "true",
      group: (group && group !== "public") ? group : null,
      image: {
        url: image?.url || "",
        public_id: image?.public_id || ""
      },
      locationName,
      locationLat,
      locationLng
    });

    await newProduct.save();
    
    return res.status(201).json({ 
      message: "Producto creado correctamente.", 
      product: newProduct 
    });

  } catch (error) {
    console.error("ERROR DETALLADO MONGOOSE:", error);
    return res.status(500).json({ 
      message: "Error al crear producto.", 
      error: error.message 
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isPublic: true })
      .populate("owner", "name locationName profileImage");
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return res.status(500).json({ message: "Error al obtener productos.", error });
  }
};

export const getUserProducts = async (req, res) => {
  try {
    const targetId = req.params.userId || req.user?._id;

    if (!targetId) {
      return res.status(400).json({ message: "No se pudo identificar al usuario." });
    }

    const products = await Product.find({ owner: targetId });
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error en getUserProducts:", error);
    return res.status(500).json({ message: "Error al obtener productos." });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de producto no válido." });
    }

    const product = await Product.findById(id).populate("owner", "name locationName profileImage rating");

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("Error al recuperar producto:", error);
    return res.status(500).json({ message: "Error al recuperar producto.", error });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Producto no encontrado." });

    const isOwner = product.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "No tienes permiso para actualizar este producto." });
    }


    if (req.body.image?.url && product.image?.public_id) {
       if (req.body.image.public_id !== product.image.public_id) {
         await deleteFromCloudinary(product.image.public_id);
       }
    }

    Object.assign(product, req.body);
    await product.save();

    return res.status(200).json({ message: "Producto actualizado correctamente.", product });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return res.status(500).json({ message: "Error al actualizar producto.", error });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ message: "Producto no encontrado." });

    if (product.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para eliminar este producto." });
    }

    if (product.image?.public_id) {
      await deleteFromCloudinary(product.image.public_id);
    }

    await product.deleteOne();
    return res.status(200).json({ message: "Producto eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return res.status(500).json({ message: "Error al eliminar producto.", error });
  }
};
