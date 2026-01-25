import mongoose from "mongoose";

const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    name: { 
      type: String, 
      required: true 
    },

    description: { 
      type: String, 
      default: "" 
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

    image: { 
      type: String, 
      default: "" 
    },

    isPrivate: { 
      type: Boolean, 
      default: false 
    },

    creator: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    members: [
      {
        user: { 
          type: Schema.Types.ObjectId, 
          ref: "user", 
          required: true 
        },
        role: { 
          type: String, 
          enum: ["member", "moderator"], 
          default: "member" 
        },
        joinedAt: { 
          type: Date, 
          default: Date.now 
        },
      },
    ],

    moderators: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      }
    ],

    pendingRequests: [
      {
        user: { 
          type: Schema.Types.ObjectId, 
          ref: "user", 
          required: true 
        },
        requestedAt: { 
          type: Date, 
          default: Date.now 
        },
      },
    ],
  },
  { timestamps: true }
);


groupSchema.pre(/^find/, function(next) {
  this.setOptions({ strictPopulate: false });
  next();
});

const Group = mongoose.model("group", groupSchema, "groups");
export default Group;
