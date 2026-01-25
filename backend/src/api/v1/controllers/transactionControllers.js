import Transaction from "../models/transaction.js";
import Product from "../models/product.js";
import User from '../models/user.js'


export const createTransaction = async (req, res) => {
  try {
    const { receiver, offeredProduct, quantityOffered, category, requestedProducts } = req.body;

    //* buscar producto solicitado
    const targetProduct = await Product.findById(offeredProduct);
    if (!targetProduct) return res.status(404).json({ message: "Producto no encontrado." });

    //* compueba si tiene stcok
    const qtyRequested = Number(quantityOffered);
    if (qtyRequested > targetProduct.quantity) {
      return res.status(400).json({ message: "El vecino no tiene stock suficiente." });
    }

    //! COMPROBAR STOCKS propio y vecino
    if (category === "intercambio" && requestedProducts && requestedProducts.length > 0) {
      for (const item of requestedProducts) {
        const myProduct = await Product.findById(item.product);
        
        if (!myProduct) continue;

        //* check del stock pripio
        if (myProduct.quantity < item.quantity) {
          return res.status(400).json({ 
            message: `No tienes suficiente stock de ${myProduct.name} para ofrecer.` 
          });
        }

        //* restar stock propio!!!!!!
        myProduct.quantity -= Number(item.quantity);
        if (myProduct.quantity <= 0) {
          myProduct.quantity = 0;
          myProduct.status = 'reserved';
        }
        await myProduct.save(); //* strock propio
        console.log(`Stock de (${myProduct.name}) actualizado.`);
      }
    }

    //* crear transacción
    const newTransaction = new Transaction({
      initiator: req.user.id,
      receiver,
      offeredProduct,
      quantityOffered: qtyRequested,
      category,
      requestedProducts
    });

    await newTransaction.save();

    //* restar stock al vecino
    targetProduct.quantity -= qtyRequested;
    if (targetProduct.quantity <= 0) {
      targetProduct.quantity = 0;
      targetProduct.status = 'reserved';
    }
    await targetProduct.save(); //* producto del vecino

    return res.status(201).json({
      message: "Transacción creada y AMBOSSS stocks actualizados.",
      transaction: newTransaction
    });

  } catch (error) {
    console.error("Error en createTransaction:", error);
    return res.status(500).json({ message: "Error al procesar el intercambio.", error: error.message });
  }
};

//* lista transacciones por usuario

export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.find({
      $or: [{ initiator: userId }, { receiver: userId }],
    })
      .populate("initiator", "name location profileImage")
      .populate("receiver", "name location profileImage")
      .populate("offeredProduct", "name image quantity category")
      .populate("requestedProducts.product", "name image quantity");

    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    return res.status(500).json({ message: "Error al obtener transacciones.", error });
  }
};

//* actualizar estado de la transacción

export const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pendiente", "aceptado", "rechazado", "concluido", "cancelado"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Estado no válido." });
    }

    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ message: "Transacción no encontrada." });

    //* permisos
    if (
      transaction.receiver.toString() !== req.user.id &&
      transaction.initiator.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "No tienes permiso para modificar esta transacción." });
    }

    const previousStatus = transaction.status;

    //* devolución de stock si se cancela o rechaza (si no lo estaba ya)

    if ((status === "rechazado" || status === "cancelado") && 
        (previousStatus !== "rechazado" && previousStatus !== "cancelado")) {
      
      const product = await Product.findById(transaction.offeredProduct);
      
      if (product) {
        product.quantity += transaction.quantityOffered;
        
        //* pasa a disponible si hay stock
        if (product.quantity > 0) {
          product.status = 'available';
        }
        await product.save();
      }
    }


    //* actualizar y guardar
    transaction.status = status;
    await transaction.save();

    return res.status(200).json({ 
      message: `Estado actualizado a ${status} correctamente.`, 
      transaction 
    });

  } catch (error) {
    console.error("Error al actualizar estado:", error);
    return res.status(500).json({ 
      message: "Error al actualizar estado de la transacción.", 
      error: error.message 
    });
  }
};

//* mensaje dentro de la transacción
export const addMessageToTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: "El mensaje no puede estar vacío." });

    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ message: "Transacción no encontrada." });

    transaction.messages.push({
      sender: req.user.id,
      content,
    });

    await transaction.save();
    return res.status(201).json({ message: "Mensaje añadido correctamente.", transaction });
  } catch (error) {
    console.error("Error al añadir mensaje:", error);
    return res.status(500).json({ message: "Error al añadir mensaje.", error });
  }
};



//* estrellitas y comentarios


export const addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ message: "Trato no encontrado." });

    //! fijar destinatario. initiator valora a receiver y al revés
   
    const targetUserId = req.user.id === transaction.initiator.toString() 
      ? transaction.receiver 
      : transaction.initiator;

    //! evitar que un user valore dos veces a otro
    const yaValorado = transaction.feedback.some(f => f.reviewer.toString() === req.user._id);
    if (yaValorado) return res.status(400).json({ message: "Ya has valorado este trato." });

    //* incluir el feedback en la transacción
    transaction.feedback.push({
      reviewer: req.user.id,
      rating: Number(rating),
      comment
    });
    await transaction.save();

    //* actualiza rating
    const targetUser = await User.findById(targetUserId);
    if (targetUser) {
      const totalReviews = targetUser.numReviews || 0;
      const currentRating = targetUser.rating || 0;

      //* calbular media
      const newRating = ((currentRating * totalReviews) + Number(rating)) / (totalReviews + 1);
      
      targetUser.rating = Number(newRating.toFixed(1)); //* un decimal
      targetUser.numReviews = totalReviews + 1;
      await targetUser.save();
    }

    return res.status(201).json({ message: "Valoración enviada correctamente." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al procesar la valoración." });
  }
};

export const getFeedbackByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const transactions = await Transaction.find({
      $and: [
        { $or: [{ initiator: userId }, { receiver: userId }] },
        { "feedback.0": { $exists: true } }
      ]
    }).populate("feedback.reviewer", "name profileImage");

    res.status(200).json(transactions || []);
  } catch (error) {
    console.error("Error al obtener feedback:", error);
    res.status(200).json([]);
  }
};



//?  { _id: ObjectId("696faf52e57b4b7b94fcb41b") }