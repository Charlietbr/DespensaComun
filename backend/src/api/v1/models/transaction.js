import mongoose from "mongoose";

const Schema = mongoose.Schema;

const transactionSchema = new mongoose.Schema(
  {
    initiator: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    offeredProduct: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },

    requestedProducts: [
      {
        user: { type: Schema.Types.ObjectId, ref: "user", required: true },
        product: { type: Schema.Types.ObjectId, ref: "product", required: true },
        quantity: { type: Number, default: 1 },
      },
    ],

    quantityOffered: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pendiente", "aceptado", "rechazado", "concluido", "cancelado"],
      default: "pendiente",
    },

    category: {
      type: String,
      enum: ["intercambio", "donación"],
      required: true,
    },

    deliveryMethod: {
      type: String,
      enum: ["a domicilio", "punto de encuentro", "otro"],
      default: "a domicilio",
    },

    deliveryLocation: { type: String },
    deliveryDate: { type: Date },

    messages: {
      type: [{
        sender: { type: Schema.Types.ObjectId, ref: "user" },
        content: { type: String },
        createdAt: { type: Date, default: Date.now },
      }],
      default: [],
    },

    feedback: {
      type: [{
        reviewer: { type: Schema.Types.ObjectId, ref: "user" },
        rating: { type: Number, min: 0, max: 5 },
        comment: { type: String },
      }],
      default: [],
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("transaction", transactionSchema, "transactions");
export default Transaction;
