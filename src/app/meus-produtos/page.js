import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Package, Leaf, Edit3 } from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import Product from "@/models/Product";
import DeleteProductButton from "./DeleteProductButton";

export default async function MeusProdutosPage() {
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

  const products = await Product.find({
    property: property._id,
  })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-12">
      <div className="max-w-lg mx-auto space-y-6">
        <header className="flex flex-col gap-4 pt-2">
          <Link
            href="/minha-propriedade"
            className="flex items-center gap-2 text-green-700 hover:underline font-medium w-fit active:scale-95 transition-transform"
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
            <span className="text-base">Voltar para Minha Propriedade</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Meus Produtos</h1>
              <p className="text-gray-600 text-base mt-1 font-medium">
                Gerencie os produtos disponíveis para venda.
              </p>
            </div>

            <Link
              href="/cadastrar-produto"
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3.5 rounded-2xl font-bold text-base hover:bg-green-700 active:scale-95 transition-all shadow-sm shrink-0"
            >
              <Plus size={22} strokeWidth={2.5} />
              <span>Criar Produto</span>
            </Link>
          </div>
        </header>

        {products.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200 p-6 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={36} strokeWidth={2} className="text-gray-400" />
            </div>

            <h2 className="text-xl font-bold text-gray-900">Nenhum produto cadastrado</h2>
            <p className="text-gray-500 text-base mt-2 mb-8 font-medium">
              Você ainda não cadastrou produtos para a sua propriedade.
            </p>

            <Link
              href="/cadastrar-produto"
              className="block w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-base hover:bg-green-700 active:scale-95 transition-all shadow-sm"
            >
              Cadastrar primeiro produto
            </Link>
          </div>
        )}

        {products.length > 0 && (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product._id.toString()}
                className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Leaf size={32} strokeWidth={2} className="text-green-200" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-lg border shrink-0 ${
                          product.active
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-500 border-gray-200"
                        }`}
                      >
                        {product.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 font-medium capitalize mt-0.5">
                      {product.category} • Estoque: {product.stockQuantity ?? 0}
                    </p>

                    <p className="text-xl font-black text-green-700 mt-1">
                      R$ {product.price?.toFixed(2)}{" "}
                      <span className="text-sm font-medium text-gray-500">
                        / {product.unit}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                  <Link
                    href={`/editar-produto/${product._id.toString()}`}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-100 bg-gray-50 text-gray-700 py-3 rounded-2xl font-bold text-base hover:bg-white hover:border-gray-300 active:scale-95 transition-all shadow-sm"
                    title="Editar produto"
                  >
                    <Edit3 size={20} strokeWidth={2.5} className="text-green-600" />
                    <span>Editar</span>
                  </Link>

                  <div className="shrink-0">
                    <DeleteProductButton
                      productId={product._id.toString()}
                      productName={product.name}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}