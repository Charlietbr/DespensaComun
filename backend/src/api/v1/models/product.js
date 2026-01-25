import mongoose from "mongoose";

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    group: {
      type: Schema.Types.ObjectId,
      ref: "group",
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    locationName: { 
      type: String, 
      default: "" 
    },
    locationLng: { 
      type: String, 
      default: "" 
    },
    locationLat: { 
      type: String, 
      default: "" 
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      enum: ["intercambio", "donación"],
      default: "intercambio",
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      enum: ["kilos", "litros", "unidades", "gramos"],
      default: "kilos",
    },

    estimatedHarvestDate: {
      type: Date,
    },

    isPublic: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["available", "reserved", "completed"],
      default: "available",
    },

    image: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("product", productSchema, "products");
export default Product;
