import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      enum: [
        "Unidade",
        "Quilo (kg)",
        "Gramas (g)",
        "Litro (L)",
        "Mililitro (ml)",
        "Maço",
        "Bandeja",
        "Caixa",
        "Dúzia",
        "Meia Dúzia",
        "Saco",
        "Feixe",
        "Metro Cúbico (m³)"
      ],
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Legumes",
        "Frutas",
        "Temperos",
        "Queijos e Laticínios",
        "Ovos",
        "Carnes e Embutidos",
        "Bebidas",
        "Mel e Derivados",
        "Doces e Geleias",
        "Panificados",
        "Mudas e Sementes",
        "Lenha e Madeira",
        "Artesanato",
        "Outros"
      ],
    },
    imageUrl: {
      type: String,
      required: true,
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;