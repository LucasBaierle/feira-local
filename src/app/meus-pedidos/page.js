"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PackageOpen, Store, ChevronRight, Loader2 } from "lucide-react";

function StatusBadge({ status }) {
  const config = {
    pending: { label: "Pendente", classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    accepted: { label: "Aceito", classes: "bg-blue-50 text-blue-700 border-blue-200" },
    completed: { label: "Finalizado", classes: "bg-green-50 text-green-700 border-green-200" },
    cancelled: { label: "Cancelado", classes: "bg-red-50 text-red-700 border-red-200" },
  };
  
  const current = config[status] || { label: status, classes: "bg-gray-50 text-gray-700 border-gray-200" };

  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${current.classes}`}>
      {current.label}
    </span>
  );
}

export default function MeusPedidosPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao carregar pedidos");
      }

      setOrders(data.orders || []);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-12">
      <div className="max-w-lg mx-auto space-y-6">
        <header className="flex flex-col gap-4 pt-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-green-700 hover:underline font-medium w-fit active:scale-95 transition-transform"
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
            <span className="text-base">Voltar</span>
          </Link>

          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Minhas Sacolas
            </h1>
            <p className="text-gray-600 text-base mt-1 font-medium">
              Acompanhe seus pedidos realizados.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-gray-500">
            <Loader2 size={40} strokeWidth={2.5} className="animate-spin text-green-600" />
            <p className="text-lg font-medium">Buscando suas sacolas...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200 p-6 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageOpen size={36} strokeWidth={2} className="text-gray-400" />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Nenhum pedido achado
            </h2>

            <p className="text-gray-500 mt-2 mb-8 font-medium">
              Você ainda não realizou nenhum pedido nas propriedades.
            </p>

            <Link
              href="/buscar-produtos"
              className="block w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 active:scale-95 transition-all shadow-sm"
            >
              Ir para a Feira
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                href={`/meus-pedidos/${order._id}`}
                className="block bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:border-green-500 transition-all active:scale-95 space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100">
                    <Store size={28} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg text-gray-900 truncate">
                      {order.propertyId?.name || "Propriedade"}
                    </h2>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-gray-50 px-4 py-2.5 rounded-2xl">
                  <span className="text-sm font-semibold text-gray-600">Situação</span>
                  <StatusBadge status={order.status} />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      Total do pedido
                    </p>
                    <p className="font-black text-green-700 text-xl">
                      R$ {Number(order.total).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-green-700 font-bold text-sm">
                    <span>Ver detalhes</span>
                    <ChevronRight size={20} strokeWidth={2.5} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}