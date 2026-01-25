import mongoose from "mongoose";

const Schema = mongoose.Schema;

const favoriteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    targetType: { 
      type: String, 
      enum: ["user", "product", "group"],
      required: true 
    },
    targetId: { 
      type: Schema.Types.ObjectId, 
      required: true, 
      refPath: 'targetType' //! populate dinámico
    },
  },
  { timestamps: true }
);


const Favorite = mongoose.model("favorite", favoriteSchema, "favorites");
export default Favorite;