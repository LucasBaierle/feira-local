import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String,
      required: true
    },
    phone: { 
      type: String,
      required: true
    },
    city: { 
      type: String,
      required: true
    },
    address: {
      street: { type: String, required: true },
      number: { type: String, required: true },
      neighborhood: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true }
    },
    mapsLink: {
      type: String,
      default: ""
    },
    bannerImageUrl: { 
      type: String,
      required: true
    },
    ownerImageUrl: { 
      type: String,
      required: true
    }
  },
  { 
    timestamps: true 
  }
);

export default mongoose.models.Property || mongoose.model("Property", propertySchema);