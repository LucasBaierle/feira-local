"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, Check } from "lucide-react";

export default function CreateProductForm({ propertyId }) {
  const router = useRouter();

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");
  const [category, setCategory] = useState("verduras");
  const [stockQuantity, setStockQuantity] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao fazer upload da imagem");
    }

    return data.url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setHasSubmitted(true);

    if (!name || !price || !imageFile) {
      setMessage({
        type: "error",
        text: "Por favor, preencha todos os campos obrigatórios em destaque.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setMessage({ type: "", text: "" });

    try {
      setLoading(true);

      const imageUrl = await uploadImage(imageFile);

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          property: propertyId,
          name,
          description,
          price: parseFloat(price),
          unit,
          category,
          stockQuantity: Number(stockQuantity) || 0,
          imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao cadastrar produto");
      }

      router.push("/meus-produtos");
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  function getInputClass(value, extraClasses = "", isRequired = true) {
    const base = `w-full border-2 rounded-2xl p-4 text-base font-medium outline-none transition-all shadow-sm ${extraClasses}`;
    if (isRequired && hasSubmitted && (value === "" || value === null || value === undefined)) {
      return `${base} border-red-500 bg-red-50 focus:bg-white focus:border-red-600 placeholder:text-red-300 text-red-900`;
    }
    return `${base} border-gray-100 bg-gray-50 focus:bg-white focus:border-green-500 text-gray-900`;
  }

  function getImageLabelClass(file) {
    const base = "flex items-center justify-center gap-2 w-full border-2 border-dashed py-4 px-4 rounded-2xl font-bold text-base cursor-pointer transition-all";
    if (hasSubmitted && !file) {
      return `${base} border-red-500 bg-red-50 text-red-700 hover:bg-red-100`;
    }
    return `${base} border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700`;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-12">
      <div className="max-w-lg mx-auto space-y-6">
        <header className="flex flex-col gap-4 pt-2">
          <Link
            href="/meus-produtos"
            className="flex items-center gap-2 text-green-700 hover:underline font-medium w-fit active:scale-95 transition-transform"
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
            <span className="text-base">Voltar para Meus Produtos</span>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Cadastrar Produto</h1>
            <p className="text-gray-600 text-sm mt-1 font-medium">
              Adicione um novo item ao catálogo da sua propriedade.
            </p>
          </div>
        </header>

        {message.text && (
          <div
            className={`p-5 rounded-2xl text-base font-medium border ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border-green-200 shadow-sm"
                : "bg-red-50 text-red-800 border-red-200 shadow-sm"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Nome do produto *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Alface Crespa Orgânica"
                className={getInputClass(name)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Descrição</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes sobre o produto, cultivo, etc."
                className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-4 text-base font-medium text-gray-900 focus:bg-white focus:border-green-500 outline-none transition-all shadow-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                  className={getInputClass(price)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Unidade *</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-4 text-base font-medium text-gray-900 focus:bg-white focus:border-green-500 outline-none transition-all shadow-sm cursor-pointer"
                >
                  <option value="kg">kg</option>
                  <option value="unidade">unidade</option>
                  <option value="maço">maço</option>
                  <option value="caixa">caixa</option>
                  <option value="duzia">dúzia</option>
                  <option value="g">g</option>
                  <option value="litro">litro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Categoria *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl p-4 text-base font-medium text-gray-900 focus:bg-white focus:border-green-500 outline-none transition-all shadow-sm capitalize cursor-pointer"
                >
                  <option value="verduras">Verduras</option>
                  <option value="legumes">Legumes</option>
                  <option value="frutas">Frutas</option>
                  <option value="graos">Grãos</option>
                  <option value="laticinios">Laticínios</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Estoque inicial
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="0"
                  className={getInputClass(stockQuantity, "", false)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Foto do produto *
              </label>
              {imagePreview && (
                <div className="mb-4 w-32 h-32 rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-50 shadow-sm">
                  <img
                    src={imagePreview}
                    alt="Pré-visualização do produto"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <label className={getImageLabelClass(imageFile)}>
                <Upload size={20} strokeWidth={2.5} className={hasSubmitted && !imageFile ? "text-red-600" : "text-green-600"} />
                <span>Escolher foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 active:scale-95 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={24} strokeWidth={2.5} className="animate-spin" />
                <span>Cadastrando...</span>
              </>
            ) : (
              <>
                <Check size={24} strokeWidth={2.5} />
                <span>Cadastrar Produto</span>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}