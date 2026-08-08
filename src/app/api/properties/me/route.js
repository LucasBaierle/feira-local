import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await connectDB();

    const property = await Property.findOne({ user: session.user.id }).lean();

    if (!property) {
      return NextResponse.json({ error: "Propriedade não encontrada" }, { status: 404 });
    }

    return NextResponse.json(property, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    const updatedProperty = await Property.findOneAndUpdate(
      { user: session.user.id },
      { $set: body },
      { new: true }
    ).lean();

    if (!updatedProperty) {
      return NextResponse.json({ error: "Propriedade não encontrada" }, { status: 404 });
    }

    return NextResponse.json(updatedProperty, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}