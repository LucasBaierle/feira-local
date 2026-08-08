import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import CreateProductForm from "./CreateProductForm";

export default async function CadastrarProdutoPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await connectDB();

  const property = await Property.findOne({
    user: session.user.id,
  }).lean();

  if (!property) {
    redirect("/cadastrar-propriedade");
  }

  return <CreateProductForm propertyId={property._id.toString()} />;
}