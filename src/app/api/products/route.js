import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Property from "@/models/Property";


export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();

    await connectDB();

    let propertyId = body.property;
    
    if (!propertyId) {
      const userProperty = await Property.findOne({ user: session.user.id });
      if (!userProperty) {
        return NextResponse.json(
          { error: "Propriedade não encontrada" },
          { status: 404 }
        );
      }
      propertyId = userProperty._id;
    }

    const product = await Product.create({
      property: propertyId,
      name: body.name,
      description: body.description,
      price: body.price,
      unit: body.unit,
      category: body.category,
      stockQuantity: body.stockQuantity,
      imageUrl: body.imageUrl,
    });

    return NextResponse.json({ success: true, product }, { status: 201 });

  } catch (error) {

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );

  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    await connectDB();

    const query = { active: true };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category && category !== "todas") {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate("property", "name city")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}