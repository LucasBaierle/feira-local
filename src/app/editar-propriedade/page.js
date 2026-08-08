import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import EditPropertyForm from "./EditPropertyForm";

export default async function EditarPropriedadePage() {
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

  const serializedProperty = {
    ...property,
    _id: property._id.toString(),
    user: property.user.toString(),
  };

  return <EditPropertyForm initialProperty={serializedProperty} />;
}