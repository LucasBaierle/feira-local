"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteProductButton({ productId, productName }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o produto "${productName}"?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao excluir o produto");
      }

      router.refresh();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center justify-center border-2 border-red-100 bg-red-50 text-red-600 px-4 py-3 rounded-2xl hover:bg-red-100 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
      title="Excluir produto"
    >
      {loading ? (
        <Loader2 size={20} strokeWidth={2.5} className="animate-spin" />
      ) : (
        <Trash2 size={20} strokeWidth={2.5} />
      )}
    </button>
  );
}