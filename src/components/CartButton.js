"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function CartButton() {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  function calculateTotalCount() {
    try {
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const totalItems = savedCart.reduce(
        (acc, item) => acc + (item.quantity || 0),
        0
      );
      setCount(totalItems);
    } catch (error) {
      console.error("Erro ao ler carrinho:", error);
    }
  }

  useEffect(() => {
    setMounted(true);
    calculateTotalCount();

    window.addEventListener("cartUpdated", calculateTotalCount);
    window.addEventListener("storage", calculateTotalCount);

    return () => {
      window.removeEventListener("cartUpdated", calculateTotalCount);
      window.removeEventListener("storage", calculateTotalCount);
    };
  }, []);

  if (!mounted) {
    return (
      <Link
        href="/carrinho"
        className="relative flex items-center justify-center p-3 bg-white rounded-2xl border-2 border-gray-100 text-gray-700 hover:border-green-300 hover:text-green-700 transition-all active:scale-95 shadow-sm"
        title="Ver Sacola"
      >
        <ShoppingBag size={24} strokeWidth={2.5} />
      </Link>
    );
  }

  return (
    <Link
      href="/carrinho"
      className="relative flex items-center justify-center p-3 bg-white rounded-2xl border-2 border-gray-100 text-gray-700 hover:border-green-300 hover:text-green-700 transition-all active:scale-95 shadow-sm"
      title="Ver Sacola"
    >
      <ShoppingBag size={24} strokeWidth={2.5} />

      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-black rounded-full h-7 w-7 flex items-center justify-center border-2 border-white shadow-sm">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}