import Message from "../models/message.js";
import Group from "../models/group.js";
import Conversation from '../models/conversation.js'




export const sendMessage = async (req, res) => {
  try {
    const { content, group, conversation } = req.body;
    const senderId = req.user._id;

    if (!content?.trim()) {
      return res.status(400).json({ message: "El mensaje no puede estar vacío." });
    }

    const newMessage = new Message({
      sender: senderId,
      content,
      group: group || null,
      conversation: conversation || null,
    });

    await newMessage.save();

 
    if (conversation && conversation !== "null") {
      try {
        await Conversation.findByIdAndUpdate(conversation, { 
          lastMessage: newMessage._id,
          updatedAt: new Date() 
        });
      } catch (convError) {
        console.error("Error actualizando conversación, pero el mensaje se guardó:", convError);
      }
    }

    const populatedMessage = await newMessage.populate("sender", "name profileImage");
    res.status(201).json({ data: populatedMessage });
  } catch (error) {
    console.error("Error crítico en sendMessage:", error);
    res.status(500).json({ message: "Error al enviar mensaje", error: error.message });
  }
};

//! privados

export const getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

       const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name profileImage") 
      .sort({ createdAt: 1 }); 

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los mensajes", error: error.message });
  }
};

//!grup
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

   
    const messages = await Message.find({ group: groupId })
      .populate("sender", "name profileImage") 
      .sort({ createdAt: 1 });
   
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error al obtener mensajes del grupo:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};
