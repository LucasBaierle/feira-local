import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    const existingProperty = await Property.findOne({ user: session.user.id });
    
    if (existingProperty) {
      return NextResponse.json({ error: "Propriedade já existe" }, { status: 400 });
    }

    const newProperty = await Property.create({
      ...body,
      user: session.user.id
    });

    return NextResponse.json(newProperty, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const properties = await Property.find({}).lean();
    return NextResponse.json(properties, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}