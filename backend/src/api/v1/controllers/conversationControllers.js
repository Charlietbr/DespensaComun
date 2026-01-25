import Conversation from "../models/conversation.js";
import Group from "../models/group.js";


export const getOrCreateConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const myId = req.user._id;

    let chat = await Conversation.findOne({
      participants: { $all: [myId, otherUserId] }
    }).populate("participants", "name profileImage");

    if (!chat) {
      chat = await Conversation.create({
        participants: [myId, otherUserId]
      });
      chat = await chat.populate("participants", "name profileImage");
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la conversación", error: error.message });
  }
};


export const getUserChats = async (req, res) => {
  try {

    const myId = req.user?._id || req.params.userId;


    const groups = await Group.find({ "members.user": myId });

    const privates = await Conversation.find({ participants: myId })
      .populate("participants", "name profileImage")
      .populate({
        path: "lastMessage",
        select: "content createdAt"
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      groups,
      privates
    });
  } catch (error) {
    res.status(500).json({ message: "Error al cargar el sidebar", error: error.message });
  }
};


export const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Conversation.findById(id).populate("participants", "name profileImage");
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la conversación", error: error.message });
  }
};