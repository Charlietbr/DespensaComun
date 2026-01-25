import mongoose from "mongoose";

const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "user", required: true },
    content: { type: String, required: true },
    
    //* mensaje para grupo
    group: { type: Schema.Types.ObjectId, ref: "group", default: null },
    
    //* mensaje privado. apunta a la conversación
    conversation: { type: Schema.Types.ObjectId, ref: "conversation", default: null },
    
    readBy: [{ type: Schema.Types.ObjectId, ref: "user" }],
  },
  { timestamps: true }
);

//* validación
messageSchema.pre("validate", function (next) {
  if (!this.conversation && !this.group) {
    return next(new Error("El mensaje debe pertenecer a una conversación privada o a un grupo"));
  }
  if (this.conversation && this.group) {
    return next(new Error("Un mensaje no puede ser privado y de grupo a la vez"));
  }
  next();
});



//* incluir indices
messageSchema.index({ conversation: 1, createdAt: -1 }); //*privados
messageSchema.index({ group: 1, createdAt: -1 });        //* de grupo

const Message = mongoose.model("message", messageSchema, "messages");
export default Message;
