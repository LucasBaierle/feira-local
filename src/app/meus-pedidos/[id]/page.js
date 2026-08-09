"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Store, 
  MapPin, 
  Phone, 
  PackageOpen, 
  Loader2, 
  X, 
  Calendar, 
  ShoppingBag, 
  Receipt,
  MessageSquare
} from "lucide-react";

export default function DetalhePedidoPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const orderId = params?.id;

  const { status } = useSession();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && orderId) {
      fetchOrderDetails();
    }
  }, [status, orderId, router]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Pedido não encontrado.");
      }

      setOrder(data);
    } catch (err) {
      setError(err.message || "Erro inesperado ao buscar detalhes do pedido.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Tem certeza que deseja cancelar este pedido?")) return;

    try {
      setCancelling(true);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!res.ok) {
        throw new Error("Não foi possível cancelar o pedido.");
      }

      await res.json();
      setOrder((prev) => ({ ...prev, status: "cancelled" }));
    } catch (err) {
      alert(err.message || "Erro ao tentar cancelar o pedido.");
    } finally {
      setCancelling(false);
    }
  };

  const getFormattedAddress = (address) => {
    if (!address) return "Endereço não informado";
    
    const { street, number, neighborhood, city, state, zipCode } = address;
    
    const streetPart = street && number ? `${street}, ${number}` : street || number || "";
    const cityStatePart = city && state ? `${city} - ${state}` : city || state || "";
    
    const fullAddress = [streetPart, neighborhood, cityStatePart, zipCode]
      .filter(Boolean)
      .join(" • "); 
      
    return fullAddress || "Endereço incompleto";
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 flex flex-col justify-center items-center gap-4 text-gray-500">
        <Loader2 size={40} strokeWidth={2.5} className="animate-spin text-green-600" />
        <p className="text-lg font-medium">Carregando detalhes do pedido...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center space-y-4 max-w-sm w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <PackageOpen size={32} strokeWidth={2} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Ops! Algo deu errado</h1>
          <p className="text-sm text-gray-500 font-medium">{error || "Pedido não encontrado."}</p>
          <Link
            href="/meus-pedidos"
            className="block w-full bg-green-600 text-white text-base font-bold py-3.5 rounded-2xl hover:bg-green-700 active:scale-95 transition-all shadow-sm"
          >
            Voltar para Meus Pedidos
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-12">
      <div className="max-w-lg mx-auto space-y-6">
        
        <header className="flex flex-col gap-4 pt-2">
          <Link
            href="/meus-pedidos"
            className="flex items-center gap-2 text-green-700 hover:underline font-medium w-fit active:scale-95 transition-transform"
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
            <span className="text-base">Voltar para Meus Pedidos</span>
          </Link>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pedido</p>
                <h1 className="text-2xl font-black text-gray-900 mt-0.5">
                  #{order._id ? order._id.slice(-6).toUpperCase() : ""}
                </h1>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium pt-3 border-t border-gray-100">
              <Calendar size={16} strokeWidth={2} className="text-gray-400" />
              <span>
                Realizado em: {order.createdAt ? new Date(order.createdAt).toLocaleString("pt-BR") : "N/A"}
              </span>
            </div>
          </div>
        </header>

        {order.status?.toLowerCase() === "pending" && (
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Ações do Pedido
            </h3>
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-3.5 px-4 rounded-2xl active:scale-95 transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <X size={18} strokeWidth={3} />
              <span>{cancelling ? "Cancelando pedido..." : "Cancelar este pedido"}</span>
            </button>
          </div>
        )}

        {order.observation && (
          <section className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3.5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={16} strokeWidth={2.5} className="text-gray-400" />
              Sua Observação
            </h3>
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-2xl border border-yellow-100 text-sm font-medium">
              {order.observation}
            </div>
          </section>
        )}

        <section className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3.5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Origem do Pedido
          </h3>
          
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold">
              <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center shrink-0 border border-orange-100">
                <Store size={16} strokeWidth={2.5} />
              </div>
              <span className="truncate">{order.propertyId?.name || "Propriedade Rural"}</span>
            </div>

            <div className="flex items-center gap-2.5 text-gray-700 font-medium">
              <div className="w-8 h-8 bg-gray-50 text-gray-600 rounded-lg flex items-center justify-center shrink-0 border border-gray-200">
                <Phone size={16} strokeWidth={2.5} />
              </div>
              {order.propertyId?.phone ? (
                <a 
                  href={`https://wa.me/55${order.propertyId.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:underline font-bold truncate"
                >
                  {order.propertyId.phone}
                </a>
              ) : (
                <span className="text-gray-400">WhatsApp não informado</span>
              )}
            </div>

            <div className="flex items-start gap-2.5 text-gray-700 font-medium pt-1">
              <div className="w-8 h-8 bg-gray-50 text-gray-600 rounded-lg flex items-center justify-center shrink-0 border border-gray-200 mt-0.5">
                <MapPin size={16} strokeWidth={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                {order.propertyId?.address ? (
                  <a
                    href={order.propertyId?.mapsLink ? order.propertyId.mapsLink : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getFormattedAddress(order.propertyId.address))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 hover:underline font-medium text-xs block leading-relaxed"
                  >
                    {getFormattedAddress(order.propertyId.address)}
                  </a>
                ) : order.propertyId?.city ? (
                  <span className="text-gray-700 text-xs">{order.propertyId.city}</span>
                ) : (
                  <span className="text-gray-400 text-xs">Endereço não informado</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3.5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Itens Solicitados
          </h3>

          <div className="divide-y divide-gray-100">
            {order.items?.map((item, idx) => (
              <div
                key={item._id || idx}
                className="py-3 first:pt-0 last:pb-0 flex justify-between items-center gap-4 text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-bold text-green-700 text-xs bg-green-50 px-2.5 py-1 rounded-xl border border-green-100 shrink-0">
                    {item.quantity}x
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {item.productId?.name || item.name || "Produto"}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      R$ {Number(item.price || 0).toFixed(2)}{" "}
                      {item.productId?.unit ? `/ ${item.productId.unit}` : ""} cada
                    </p>
                  </div>
                </div>
                <span className="font-bold text-gray-900 shrink-0 text-sm">
                  R${" "}
                  {(
                    item.subtotal ||
                    (item.price || 0) * (item.quantity || 1)
                  ).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3.5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Resumo Financeiro
          </h3>

          {order.deliveryAddress && (
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-1 mb-2">
              <p className="font-bold text-gray-900">Endereço de Entrega:</p>
              <p className="font-medium">
                {order.deliveryAddress.street && `${order.deliveryAddress.street}, `}
                {order.deliveryAddress.number && `${order.deliveryAddress.number} `}
                {order.deliveryAddress.neighborhood && `- ${order.deliveryAddress.neighborhood}`}
              </p>
              <p className="font-medium">
                {order.deliveryAddress.city && `${order.deliveryAddress.city}`}
                {order.deliveryAddress.state && `/${order.deliveryAddress.state}`}
              </p>
            </div>
          )}

          <div className="pt-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-base text-gray-900">Total</span>
              <span className="text-xl font-black text-green-700">
                R$ {Number(order.total || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

function StatusBadge({ status }) {
  const config = {
    pending: { label: "Pendente", classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    confirmed: { label: "Confirmado", classes: "bg-blue-50 text-blue-700 border-blue-200" },
    accepted: { label: "Aceito", classes: "bg-blue-50 text-blue-700 border-blue-200" },
    completed: { label: "Finalizado", classes: "bg-green-50 text-green-700 border-green-200" },
    cancelled: { label: "Cancelado", classes: "bg-red-50 text-red-700 border-red-200" },
  };

  const normalizedStatus = status?.toLowerCase() || "pending";
  const current = config[normalizedStatus] || { label: status, classes: "bg-gray-50 text-gray-700 border-gray-200" };

  return (
    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${current.classes}`}>
      {current.label}
    </span>
  );
}