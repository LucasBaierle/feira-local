"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, ShoppingBag, Store, Leaf, Minus, Plus } from "lucide-react";

export default function CarrinhoPage() {
  const [cart, setCart] = useState([]);
  const [observation, setObservation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    function loadCart() {
      try {
        const rawCart = window.localStorage.getItem("cart");
        if (rawCart && rawCart !== "undefined" && rawCart !== "null") {
          const parsed = JSON.parse(rawCart);
          if (Array.isArray(parsed)) {
            setCart(parsed);
          }
        } else {
          setCart([]);
        }
      } catch (error) {
        setCart([]);
      }
    }

    loadCart();

    window.addEventListener("cartUpdated", loadCart);
    window.addEventListener("storage", loadCart);

    return () => {
      window.removeEventListener("cartUpdated", loadCart);
      window.removeEventListener("storage", loadCart);
    };
  }, []);

  function updateQuantity(id, change) {
    const updatedCart = cart
      .map((item) => {
        if (item._id === id) {
          const newQuantity = (item.quantity || 1) + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      })
      .filter(Boolean);

    setCart(updatedCart);
    window.localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  }

  function removeItem(id) {
    const updatedCart = cart.filter((item) => item._id !== id);
    setCart(updatedCart);
    window.localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  }

  function clearCart() {
    setCart([]);
    setObservation("");
    window.localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));
  }

  const total = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  async function finishOrder() {
    try {
      setErrorMessage("");

      if (!cart.length) return;

      if (status === "unauthenticated") {
        router.push("/login");
        return;
      }

      const groups = {};

      for (const item of cart) {
        if (!groups[item.propertyId]) {
          groups[item.propertyId] = [];
        }

        groups[item.propertyId].push(item);
      }

      for (const propertyId of Object.keys(groups)) {
        const items = groups[propertyId];

        const total = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            propertyId,
            total,
            observation,
            items: items.map((item) => ({
              productId: item._id,
              quantity: item.quantity,
              price: item.price,
            })),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 400 && data.error === "Complete seu endereço e WhatsApp no perfil antes de comprar.") {
            setErrorMessage(data.error);
            setTimeout(() => {
              router.push("/perfil");
            }, 3000);
            return;
          }
          throw new Error(data.error || "Erro ao finalizar pedido");
        }
      }

      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));

      window.location.href = "/meus-pedidos";
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <header className="flex flex-col gap-4 pt-2">
          <div className="flex items-center justify-between">
            <Link
              href="/buscar-produtos"
              className="flex items-center gap-2 text-green-700 hover:underline font-medium w-fit active:scale-95 transition-transform"
            >
              <ArrowLeft size={24} strokeWidth={2.5} />
              <span className="text-base">Continuar comprando</span>
            </Link>

            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 px-4 py-2 rounded-xl active:scale-95 transition-all"
              >
                Esvaziar
              </button>
            )}
          </div>
          
          <div>
            <h1 className="text-2xl font-black text-gray-900">Minha Sacola</h1>
            <p className="text-gray-600 text-sm mt-1 font-medium">
              Confira seus produtos antes de fechar o pedido.
            </p>
          </div>
        </header>

        {errorMessage && (
          <div className="p-5 rounded-2xl text-base font-medium border bg-red-50 text-red-800 border-red-200 shadow-sm">
            {errorMessage}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} strokeWidth={2} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Sua sacola está vazia</h2>
            <p className="text-gray-500 text-sm mt-2 mb-6 font-medium">
              Adicione produtos das propriedades para continuar com a compra.
            </p>
            <Link
              href="/buscar-produtos"
              className="block w-full bg-green-600 text-white py-4 rounded-xl font-bold text-base hover:bg-green-700 active:scale-95 transition-all shadow-sm"
            >
              Ver produtos disponíveis
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name || "Produto"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Leaf size={32} strokeWidth={2} className="text-green-200" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 truncate">
                        {item.name}
                      </h3>
                      {item.propertyName && (
                        <div className="flex items-center gap-1.5 text-gray-500 mt-0.5">
                          <Store size={16} strokeWidth={2.5} className="text-orange-500 shrink-0" />
                          <p className="text-sm font-medium truncate">
                            {item.propertyName}
                          </p>
                        </div>
                      )}
                      <p className="text-lg font-black text-green-700 mt-1">
                        R$ {Number(item.price || 0).toFixed(2)}{" "}
                        <span className="text-sm font-medium text-gray-500">
                          / {item.unit || "un"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-200 p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, -1)}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-700 active:scale-95 transition-all"
                      >
                        <Minus size={20} strokeWidth={2.5} />
                      </button>
                      <span className="font-bold text-lg min-w-[1.5rem] text-center">
                        {item.quantity || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, 1)}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-700 active:scale-95 transition-all"
                      >
                        <Plus size={20} strokeWidth={2.5} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold active:scale-95 transition-all"
                      title="Remover item"
                    >
                      <Trash2 size={20} strokeWidth={2.5} />
                      <span className="text-sm">Remover</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div>
                <label className="block text-base font-bold text-gray-900 mb-2">
                  Observação para o produtor
                </label>
                <textarea
                  rows={2}
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Ex: Por favor, escolher tomates mais verdes."
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-4 text-base font-medium text-gray-900 focus:bg-white focus:border-green-500 outline-none transition-all shadow-sm resize-none"
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-gray-600">Total:</span>
                <span className="text-2xl font-black text-green-700">
                  R$ {total.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={finishOrder}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 active:scale-95 transition-all shadow-sm"
              >
                Fechar Pedido
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}