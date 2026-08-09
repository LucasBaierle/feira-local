"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CartButton from "@/components/CartButton";
import { ArrowLeft, Search, Leaf, Store, ShoppingBag, Check } from "lucide-react";

export default function SearchProductsClient({ initialProducts }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todas");
  const [loading, setLoading] = useState(false);
  const [addedId, setAddedId] = useState(null);

  async function handleFilter(newSearch, newCategory) {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (newSearch) params.append("search", newSearch);
      if (newCategory && newCategory !== "todas") params.append("category", newCategory);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchChange(e) {
    const value = e.target.value;
    setSearch(value);
    handleFilter(value, category);
  }

  function handleCategoryChange(selectedCategory) {
    setCategory(selectedCategory);
    handleFilter(search, selectedCategory);
  }

  function addToCart(e, product) {
    e.stopPropagation();

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

    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1500);
  }

  const categories = [
    { id: "todas", label: "Todos" },
    { id: "Verduras", label: "Verduras" },
    { id: "Frutas", label: "Frutas" },
    { id: "Legumes", label: "Legumes" },
    { id: "Temperos", label: "Temperos" },
    { id: "Queijos e Laticínios", label: "Queijos e Laticínios" },
    { id: "Ovos", label: "Ovos" },
    { id: "Carnes e Embutidos", label: "Carnes e Embutidos" },
    { id: "Bebidas", label: "Bebidas" },
    { id: "Mel e Derivados", label: "Mel e Derivados" },
    { id: "Doces e Geleias", label: "Doces e Geleias" },
    { id: "Panificados", label: "Panificados" },
    { id: "Mudas e Sementes", label: "Mudas e Sementes" },
    { id: "Lenha e Madeira", label: "Lenha e Madeira" },
    { id: "Artesanato", label: "Artesanato" },
    { id: "Outros", label: "Outros" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-12">
      <div className="max-w-lg mx-auto space-y-6">
        
        <header className="flex flex-col gap-4 pt-2">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-green-700 hover:underline font-medium w-fit active:scale-95 transition-transform">
              <ArrowLeft size={24} strokeWidth={2.5} />
              <span className="text-base">Voltar</span>
            </Link>
            <CartButton />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Comprar na Feira</h1>
            <p className="text-gray-600 text-sm mt-1 font-medium">
              Escolha os produtos e coloque na sua sacola.
            </p>
          </div>
        </header>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={20} strokeWidth={2.5} className="text-green-600" />
            </div>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Buscar verdura, mel, queijo..."
              className="w-full border-2 border-gray-100 bg-white rounded-2xl p-3 pl-10 text-base font-medium text-gray-900 focus:bg-white focus:border-green-500 outline-none transition-all shadow-sm placeholder:text-gray-400"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`snap-start shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm border-2 ${
                  category === cat.id
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-100 hover:border-green-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-base font-medium">Procurando produtos nas propriedades...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={28} strokeWidth={2} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Nenhum produto achado</h3>
            <p className="text-gray-500 text-sm mt-2 font-medium">Tente buscar por outro nome ou mudar a categoria.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => router.push(`/produto/${product._id}`)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4 cursor-pointer transition-transform hover:scale-[1.02] hover:border-green-500 hover:shadow-md"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
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
                    <h2 className="font-bold text-lg text-gray-900 truncate">
                      {product.name}
                    </h2>
                    
                    {product.property?.name && (
                      <div className="flex items-center gap-1.5 text-gray-500 mt-0.5">
                        <Store size={16} strokeWidth={2.5} className="text-orange-500 shrink-0" />
                        <p className="text-sm font-medium truncate">
                          {product.property.name}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-xl font-black text-green-700 mt-1">
                      R$ {product.price?.toFixed(2)}{" "}
                      <span className="text-sm font-medium text-gray-500">/ {product.unit}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => addToCart(e, product)}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-base active:scale-95 transition-all shadow-sm border-2 ${
                    addedId === product._id
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-green-600 text-white border-green-600 hover:bg-green-700"
                  }`}
                >
                  {addedId === product._id ? (
                    <>
                      <Check size={20} strokeWidth={3} />
                      Na sua sacola!
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={20} strokeWidth={2.5} />
                      Colocar na Sacola
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}