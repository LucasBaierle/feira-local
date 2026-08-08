import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Property from "@/models/Property";
import EditProductForm from "./EditProductForm";

export default async function EditarProdutoPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const productId = resolvedParams?.id;

  if (!productId) {
    redirect("/meus-produtos");
  }

  await connectDB();

  const property = await Property.findOne({ user: session.user.id }).lean();

  if (!property) {
    redirect("/cadastrar-propriedade");
  }

  const product = await Product.findById(productId).lean();

  if (!product || product.property.toString() !== property._id.toString()) {
    redirect("/meus-produtos");
  }

  const serializedProduct = {
    ...product,
    _id: product._id.toString(),
    property: product.property.toString(),
  };

  return <EditProductForm initialProduct={serializedProduct} />;
}