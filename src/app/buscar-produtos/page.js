import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Property from "@/models/Property";
import SearchProductsClient from "./SearchProductsClient";

export const dynamic = "force-dynamic";

export default async function BuscarProdutosPage() {
  await connectDB();

  const products = await Product.find({ active: true })
    .populate("property", "_id name city")
    .sort({ createdAt: -1 })
    .lean();

  const serializedProducts = products.map((product) => ({
    ...product,
    _id: product._id.toString(),
    property: product.property
      ? {
          _id: product.property._id.toString(),
          name: product.property.name,
          city: product.property.city,
        }
      : null,
  }));

  return <SearchProductsClient initialProducts={serializedProducts} />;
}