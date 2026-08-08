import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";

import Order from "@/models/Order";
import OrderItem from "@/models/OrderItem";
import Property from "@/models/Property";
import User from "@/models/User";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.propertyId || !body.items?.length) {
      return NextResponse.json({ error: "Dados do pedido inválidos" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user.phone || !user.address?.street || !user.address?.number || !user.address?.city) {
      return NextResponse.json(
        { error: "Complete seu endereço e WhatsApp no perfil antes de comprar." },
        { status: 400 }
      );
    }

    const total = body.items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );

    const order = await Order.create({
      customerId: session.user.id,
      propertyId: body.propertyId,
      total,
      observation: body.observation || "",
      deliveryAddress: user.address,
      status: "pending",
    });

    const items = body.items.map((item) => ({
      orderId: order._id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.quantity * item.price,
    }));

    await OrderItem.insertMany(items);

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    await connectDB();

    let query = {};

    if (propertyId) {
      const userProperty = await Property.findOne({
        _id: propertyId,
        user: session.user.id,
      });

      if (!userProperty) {
        return NextResponse.json(
          { error: "Propriedade não encontrada ou sem permissão" },
          { status: 403 }
        );
      }

      query = { propertyId };
    } else {
      query = { customerId: session.user.id };
    }

    const orders = await Order.find(query)
      .populate("customerId", "name email phone")
      .populate("propertyId", "name bannerImageUrl city state")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}