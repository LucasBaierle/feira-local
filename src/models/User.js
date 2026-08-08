import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    phone: {
      type: String,
      default: "",
    },

    address: {
      street: {
        type: String,
        default: "",
      },
      number: {
        type: String,
        default: "",
      },
      neighborhood: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "",
      },
      state: {
        type: String,
        default: "",
      },
      zipCode: {
        type: String,
        default: "",
      },
    },

    role: {
      type: String,
      enum: ["cliente", "produtor"],
      default: "cliente",
    },

    avatarUrl: String,
  },
  {
    timestamps: true,
  }
);

export default
  mongoose.models.User ||
  mongoose.model("User", userSchema);