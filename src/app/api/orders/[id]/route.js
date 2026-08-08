import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import OrderItem from "@/models/OrderItem";
import Product from "@/models/Product";
import Property from "@/models/Property";
import User from "@/models/User";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const resolvedParams = await params;
    const orderId = resolvedParams?.id;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "ID de pedido inválido" }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findById(orderId)
      .populate("propertyId", "name bannerImageUrl city state ownerId owner user address phone")
      .populate("customerId", "name email phone address")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    const currentUserId = session.user.id.toString();
    const customerIdStr = order.customerId?._id
      ? order.customerId._id.toString()
      : order.customerId?.toString();

    const isCustomer = customerIdStr === currentUserId;
    const isOwner =
      order.propertyId?.ownerId?.toString() === currentUserId ||
      order.propertyId?.owner?.toString() === currentUserId ||
      order.propertyId?.user?.toString() === currentUserId;

    if (!isCustomer && !isOwner) {
      return NextResponse.json(
        { error: "Você não tem permissão para visualizar este pedido." },
        { status: 403 }
      );
    }

    const items = await OrderItem.find({ orderId: order._id })
      .populate("productId", "name imageUrl unit price")
      .lean();

    return NextResponse.json({ ...order, items }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar pedido por ID:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const resolvedParams = await params;
    const orderId = resolvedParams?.id;
    const { status: newStatus } = await req.json();

    if (!newStatus) {
      return NextResponse.json({ error: "Status não informado" }, { status: 400 });
    }

    await connectDB();

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: newStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar pedido." }, { status: 500 });
  }
}