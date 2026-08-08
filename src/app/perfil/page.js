"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, MapPin, Loader2, Check } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    avatarUrl: "",
    address: {
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await fetch("/api/users/me");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao carregar perfil");

      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        avatarUrl: data.avatarUrl || "",
        address: {
          street: data.address?.street || "",
          number: data.address?.number || "",
          neighborhood: data.address?.neighborhood || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          zipCode: data.address?.zipCode || "",
        },
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  function handleAddressChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setHasSubmitted(true);

    const { street, number, neighborhood, city, state, zipCode } = formData.address;

    if (
      !formData.name ||
      !formData.phone ||
      !street ||
      !number ||
      !neighborhood ||
      !city ||
      !state ||
      !zipCode
    ) {
      setMessage({
        type: "error",
        text: "Por favor, preencha todos os campos obrigatórios em destaque.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao salvar perfil");

      setMessage({
        type: "success",
        text: "Perfil e endereço atualizados com sucesso!",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function getInputClass(value, extraClasses = "") {
    const base = `w-full border-2 rounded-2xl p-4 text-base outline-none transition-all ${extraClasses}`;
    if (hasSubmitted && (!value || value.trim() === "")) {
      return `${base} border-red-500 bg-red-50 focus:bg-white focus:border-red-600 placeholder:text-red-300 text-red-900`;
    }
    return `${base} border-gray-100 bg-gray-50 focus:bg-white focus:border-green-500`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center gap-4 text-gray-500">
        <Loader2 size={40} strokeWidth={2.5} className="animate-spin text-green-600" />
        <p className="text-lg font-medium">Carregando dados do perfil...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-12">
      <div className="max-w-lg mx-auto space-y-6">
        <header className="flex flex-col gap-4 pt-2">
          <Link href="/" className="flex items-center gap-2 text-green-700 hover:underline font-medium w-fit active:scale-95 transition-transform">
            <ArrowLeft size={24} strokeWidth={2.5} />
            <span className="text-lg">Voltar</span>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Meu Cadastro</h1>
            <p className="text-gray-600 text-base mt-1 font-medium">
              Mantenha seu endereço atualizado para que os produtores saibam onde entregar seus pedidos.
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
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border-2 border-green-100">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt={formData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={32} strokeWidth={2} className="text-gray-400" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-2xl text-gray-900 truncate">{formData.name}</h2>
              <p className="text-base text-gray-500 mt-0.5 truncate">{formData.email}</p>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 mb-4 text-gray-900">
              <User size={24} strokeWidth={2.5} className="text-green-600" />
              <h2 className="font-bold text-xl">Dados Pessoais</h2>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={getInputClass(formData.name)}
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Telefone / WhatsApp *
              </label>
              <input
                type="text"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={getInputClass(formData.phone)}
              />
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 mb-4 text-gray-900">
              <MapPin size={24} strokeWidth={2.5} className="text-green-600" />
              <h2 className="font-bold text-xl">Endereço de Entrega</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Rua / Logradouro *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rua das Flores"
                  value={formData.address.street}
                  onChange={(e) => handleAddressChange("street", e.target.value)}
                  className={getInputClass(formData.address.street)}
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Número *
                </label>
                <input
                  type="text"
                  placeholder="Ex: 123"
                  value={formData.address.number}
                  onChange={(e) => handleAddressChange("number", e.target.value)}
                  className={getInputClass(formData.address.number)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Bairro *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Centro"
                  value={formData.address.neighborhood}
                  onChange={(e) => handleAddressChange("neighborhood", e.target.value)}
                  className={getInputClass(formData.address.neighborhood)}
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  CEP *
                </label>
                <input
                  type="text"
                  placeholder="00000-000"
                  value={formData.address.zipCode}
                  onChange={(e) => handleAddressChange("zipCode", e.target.value)}
                  className={getInputClass(formData.address.zipCode)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Cidade *
                </label>
                <input
                  type="text"
                  placeholder="Ex: São Paulo"
                  value={formData.address.city}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                  className={getInputClass(formData.address.city)}
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Estado (UF) *
                </label>
                <input
                  type="text"
                  placeholder="Ex: SP"
                  maxLength={2}
                  value={formData.address.state}
                  onChange={(e) =>
                    handleAddressChange("state", e.target.value.toUpperCase())
                  }
                  className={getInputClass(formData.address.state, "uppercase")}
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 active:scale-95 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={24} strokeWidth={2.5} className="animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Check size={24} strokeWidth={2.5} />
                <span>Salvar Alterações</span>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}