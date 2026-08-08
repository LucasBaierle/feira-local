"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  PackageOpen, 
  Loader2, 
  Check, 
  X, 
  ShoppingBag, 
  Calendar, 
  Receipt,
  MessageSquare
} from "lucide-react";

export default function ProprietarioDetalhePedidoPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const orderId = params?.id;

  const { status } = useSession();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && orderId) {
      loadOrder();
    }
  }, [status, orderId, router]);

  async function loadOrder() {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao carregar os detalhes do pedido");
      }

      setOrder(data.order || data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(newStatus) {
    try {
      setUpdating(true);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar status do pedido");
      }

      setOrder((prev) => ({ ...prev, status: newStatus }));
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  }

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

  const formatPhone = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 flex flex-col justify-center items-center gap-4 text-gray-500">
        <Loader2 size={40} strokeWidth={2.5} className="animate-spin text-green-600" />
        <p className="text-lg font-medium">Carregando detalhes do pedido...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 pb-12">
        <div className="max-w-lg mx-auto space-y-6">
          <Link
            href="/minha-propriedade/pedidos"
            className="flex items-center gap-2 text-green-700 hover:underline font-medium w-fit active:scale-95 transition-transform pt-2"
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
            <span className="text-base">Voltar aos pedidos</span>
          </Link>
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200 p-6 shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageOpen size={32} strokeWidth={2} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Pedido não encontrado</h2>
            <p className="text-gray-500 text-sm mt-2 font-medium">Verifique se o link está correto.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-12">
      <div className="max-w-lg mx-auto space-y-6">
        
        <header className="flex flex-col gap-4 pt-2">
          <Link
            href="/minha-propriedade/pedidos"
            className="flex items-center gap-2 text-green-700 hover:underline font-medium w-fit active:scale-95 transition-transform"
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
            <span className="text-base">Voltar para Pedidos</span>
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

        {order.status === "pending" && (
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Ações do Pedido
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={updating}
                onClick={() => handleStatusUpdate("accepted")}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-2xl active:scale-95 transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Check size={18} strokeWidth={3} />
                <span>Aceitar</span>
              </button>
              <button
                disabled={updating}
                onClick={() => handleStatusUpdate("cancelled")}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-3.5 px-4 rounded-2xl active:scale-95 transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <X size={18} strokeWidth={3} />
                <span>Recusar</span>
              </button>
            </div>
          </div>
        )}

        {order.status === "accepted" && (
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Ações do Pedido
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={updating}
                onClick={() => handleStatusUpdate("completed")}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-2xl active:scale-95 transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Check size={18} strokeWidth={3} />
                <span>Concluir</span>
              </button>
              <button
                disabled={updating}
                onClick={() => handleStatusUpdate("cancelled")}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-3.5 px-4 rounded-2xl active:scale-95 transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <X size={18} strokeWidth={3} />
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        )}

        {(order.status === "completed" || order.status === "cancelled") && (
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
            <p className="text-sm text-gray-500 font-medium">
              Este pedido já foi <span className="font-bold">{order.status === "completed" ? "concluído" : "cancelado"}</span> e não permite mais alterações.
            </p>
          </div>
        )}

        {order.observation && (
          <section className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3.5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={16} strokeWidth={2.5} className="text-gray-400" />
              Observação do Cliente
            </h3>
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-2xl border border-yellow-100 text-sm font-medium">
              {order.observation}
            </div>
          </section>
        )}

        <section className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3.5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Dados do Cliente
          </h3>
          
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold">
              <div className="w-8 h-8 bg-gray-50 text-gray-600 rounded-lg flex items-center justify-center shrink-0 border border-gray-200">
                <User size={16} strokeWidth={2.5} />
              </div>
              <span className="truncate">{order.customerId?.name || "Não informado"}</span>
            </div>

            <div className="flex items-center gap-2.5 text-gray-700 font-medium">
              <div className="w-8 h-8 bg-gray-50 text-gray-600 rounded-lg flex items-center justify-center shrink-0 border border-gray-200">
                <Phone size={16} strokeWidth={2.5} />
              </div>
              {order.customerId?.phone ? (
                <a 
                  href={`https://wa.me/55${order.customerId.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:underline font-bold truncate"
                >
                  {formatPhone(order.customerId.phone)}
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
                {order.customerId?.address ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getFormattedAddress(order.customerId.address))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 hover:underline font-medium text-xs block leading-relaxed"
                  >
                    {getFormattedAddress(order.customerId.address)}
                  </a>
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
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <div key={index} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center gap-4 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-bold text-green-700 text-xs bg-green-50 px-2.5 py-1 rounded-xl border border-green-100 shrink-0">
                      {item.quantity}x
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {item.productId?.name || item.name || "Produto"}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        R$ {Number(item.price || 0).toFixed(2)} cada
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0 text-sm">
                    R$ {(Number(item.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 font-medium">Nenhum item encontrado.</p>
            )}
          </div>
        </section>

        <section className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3.5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Resumo Financeiro
          </h3>

          <div className="pt-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-base text-gray-900">Total a Receber</span>
              <span className="text-xl font-black text-green-700">
                R$ {Number(order.total || order.totalAmount || 0).toFixed(2)}
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