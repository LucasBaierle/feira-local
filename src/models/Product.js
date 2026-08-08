import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "A propriedade é obrigatória"],
    },
    name: {
      type: String,
      required: [true, "O nome é obrigatório"],
    },
    description: String,
    price: {
      type: Number,
      required: [true, "O preço é obrigatório"],
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "unidade", "maço", "caixa", "duzia", "dúzia", "g", "litro"], 
    },
    category: {
      type: String,
      required: true,
      enum: ["verduras", "legumes", "frutas", "graos", "laticinios", "outros"],
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
    imageUrl: String,
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);