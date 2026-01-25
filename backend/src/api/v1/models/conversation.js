import mongoose from "mongoose";
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    //* dos usuarios del chat privado
    participants: [
      { type: Schema.Types.ObjectId, ref: "user", required: true }
    ],
    //* vista previa del último mensaje para mostrar en chat-sidebar
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "message"
    },
  },
  { timestamps: true }
);

//* se crea un índice para que no haya dos conversaciones entre particulares
conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model("conversation", conversationSchema, "conversations");
export default Conversation;