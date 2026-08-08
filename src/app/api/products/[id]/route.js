import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Property from "@/models/Property";

export async function GET(
  request,
  { params }
) {

  try {

    await connectDB();

    const product = await Product.findById(
      params.id
    )
      .populate(
        "propertyId",
        "name location bannerUrl"
      );

    if (!product) {
      return NextResponse.json(
        {
          error: "Produto não encontrado",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });


  } catch (error) {
    return NextResponse.json({ success: false,error: error.message, }, { status: 500, });
  }

}

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const params = await context.params;
    const productId = params?.id;

    if (!productId) {
      return NextResponse.json({ error: "ID do produto inválido" }, { status: 400 });
    }

    const body = await request.json();

    await connectDB();

    const property = await Property.findOne({ user: session.user.id });

    if (!property) {
      return NextResponse.json(
        { error: "Propriedade não encontrada para este usuário" },
        { status: 404 }
      );
    }

    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: productId,
        property: property._id,
      },
      {
        name: body.name,
        description: body.description,
        price: body.price,
        unit: body.unit,
        category: body.category,
        stockQuantity: body.stockQuantity,
        imageUrl: body.imageUrl,
        active: body.active,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Produto não encontrado ou sem permissão para editar" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const params = await context.params;
    const productId = params?.id;

    if (!productId) {
      return NextResponse.json({ error: "ID do produto inválido" }, { status: 400 });
    }

    await connectDB();

    const property = await Property.findOne({ user: session.user.id });

    if (!property) {
      return NextResponse.json(
        { error: "Propriedade não encontrada para este usuário" },
        { status: 404 }
      );
    }

    const deletedProduct = await Product.findOneAndDelete({
      _id: productId,
      property: property._id,
    });

    if (!deletedProduct) {
      return NextResponse.json(
        { error: "Produto não encontrado ou sem permissão para deletar" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Produto removido com sucesso",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}