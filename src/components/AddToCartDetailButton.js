"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";

export default function AddToCartDetailButton({ product }) {
  const [added, setAdded] = useState(false);

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex((item) => item._id === product._id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        _id: product._id,
        propertyId: product.property?._id,
        propertyName: product.property?.name || "",
        name: product.name,
        price: product.price,
        unit: product.unit,
        imageUrl: product.imageUrl,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={addToCart}
      className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2 ${
        added
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-green-600 text-white hover:bg-green-700"
      }`}
    >
      {added ? (
        <>
          <Check size={20} strokeWidth={3} />
          Na sua sacola!
        </>
      ) : (
        <>
          <ShoppingBag size={20} strokeWidth={2.5} />
          Adicionar à Sacola
        </>
      )}
    </button>
  );
}