import mongoose, { Mongoose } from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { 
      type: String, 
      required: true 
    },

    email: { 
      type: String, 
      required: true, 
      unique: true 
    },

    password: { 
      type: String, 
      required: true 
    },



    //*DOLOR DE COORDENADAS
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


    profileImage: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },

    title: { 
      type: String, 
      default: "" 
    },

    bio: { 
      type: String, 
      default: "" 
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    groups: {
      type: [{ type: Schema.Types.ObjectId, ref: "group" }],
      default: [],
    },

    moderatorInGroups: {
      type: [{ type: Schema.Types.ObjectId, ref: "group" }],
      default: [],
    },

    //* puntuaciones
    rating: { 
      type: Number, 
      default: 0 
    },

    numReviews: { 
      type: Number, 
      default: 0 
    },

    transactionsCount: { 
      type: Number, 
      default: 0 
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", userSchema, "users");
export default User;
