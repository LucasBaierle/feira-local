"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Store, MapPin, Upload, Loader2, Check } from "lucide-react";

export default function EditPropertyForm({ initialProperty }) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const addressData = typeof initialProperty?.address === 'object' && initialProperty?.address !== null 
    ? initialProperty.address 
    : {};

  const [formData, setFormData] = useState({
    name: initialProperty?.name || "",
    description: initialProperty?.description || "",
    phone: initialProperty?.phone || "",
    mapsLink: initialProperty?.mapsLink || "",
    bannerImageUrl: initialProperty?.bannerImageUrl || "",
    ownerImageUrl: initialProperty?.ownerImageUrl || "",
    address: {
      street: addressData.street || "",
      number: addressData.number || "",
      neighborhood: addressData.neighborhood || "",
      city: addressData.city || initialProperty?.city || "",
      state: addressData.state || "",
      zipCode: addressData.zipCode || "",
    },
  });

  const [bannerFile, setBannerFile] = useState(null);
  const [ownerFile, setOwnerFile] = useState(null);

  function handleAddressChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  }

  function handleBannerChange(e) {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setFormData((prev) => ({ ...prev, bannerImageUrl: URL.createObjectURL(file) }));
    }
  }

  function handleOwnerChange(e) {
    const file = e.target.files[0];
    if (file) {
      setOwnerFile(file);
      setFormData((prev) => ({ ...prev, ownerImageUrl: URL.createObjectURL(file) }));
    }
  }

  async function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 1280;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                  type: "image/webp",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error("Falha ao comprimir imagem"));
              }
            },
            "image/webp",
            0.8
          );
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  async function uploadImage(file) {
    const compressedFile = await compressImage(file);
    const formDataUpload = new FormData();
    formDataUpload.append("file", compressedFile);
    
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formDataUpload,
    });
    
    if (!res.ok) {
      throw new Error("Falha no upload da imagem");
    }
    
    const data = await res.json();
    return data.secure_url || data.url || "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setHasSubmitted(true);

    const { street, number, neighborhood, city, state, zipCode } = formData.address;
    
    if (
      !formData.name || 
      !formData.description || 
      !formData.phone || 
      !street || 
      !number || 
      !neighborhood || 
      !city || 
      !state || 
      !zipCode ||
      !formData.bannerImageUrl ||
      !formData.ownerImageUrl
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
      let bannerImageUrl = initialProperty?.bannerImageUrl || "";
      let ownerImageUrl = initialProperty?.ownerImageUrl || "";

      if (bannerFile) {
        bannerImageUrl = await uploadImage(bannerFile);
      }
      if (ownerFile) {
        ownerImageUrl = await uploadImage(ownerFile);
      }

      const res = await fetch("/api/properties/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          phone: formData.phone,
          address: formData.address,
          city: formData.address.city,
          mapsLink: formData.mapsLink,
          bannerImageUrl,
          ownerImageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao atualizar propriedade");

      setMessage({
        type: "success",
        text: "Propriedade atualizada com sucesso!",
      });

      router.push("/minha-propriedade");
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  function getInputClass(value, extraClasses = "", isRequired = true) {
    const base = `w-full border-2 rounded-2xl p-4 text-base outline-none transition-all ${extraClasses}`;
    if (isRequired && hasSubmitted && (!value || String(value).trim() === "")) {
      return `${base} border-red-500 bg-red-50 focus:bg-white focus:border-red-600 placeholder:text-red-300 text-red-900`;
    }
    return `${base} border-gray-100 bg-gray-50 focus:bg-white focus:border-green-500`;
  }

  function getImageLabelClass(imageUrl) {
    const base = "flex items-center justify-center gap-2 w-full border-2 border-dashed py-4 px-4 rounded-2xl font-bold text-base cursor-pointer transition-all";
    if (hasSubmitted && !imageUrl) {
      return `${base} border-red-500 bg-red-50 text-red-700 hover:bg-red-100`;
    }
    return `${base} border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700`;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-12">
      <div className="max-w-lg mx-auto space-y-6">
        <header className="flex flex-col gap-4 pt-2">
          <Link
            href="/minha-propriedade"
            className="flex items-center gap-2 text-green-700 hover:underline font-medium w-fit active:scale-95 transition-transform"
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
            <span className="text-lg">Voltar para Minha Propriedade</span>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Editar Propriedade</h1>
            <p className="text-gray-600 text-base mt-1 font-medium">
              Atualize as informações, endereço e imagens da sua barraca.
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
            <div className={`w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 border-2 ${hasSubmitted && !formData.ownerImageUrl ? 'border-red-400' : 'border-green-100'}`}>
              {formData.ownerImageUrl ? (
                <img
                  src={formData.ownerImageUrl}
                  alt={formData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store size={32} strokeWidth={2} className={hasSubmitted && !formData.ownerImageUrl ? "text-red-400" : "text-orange-500"} />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-xl text-gray-900 truncate">{formData.name || "Sua Propriedade"}</h2>
              <p className="text-sm text-gray-500 font-medium mt-0.5 truncate">{formData.address.city || "Cidade não informada"}</p>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 mb-4 text-gray-900">
              <Store size={24} strokeWidth={2.5} className="text-green-600" />
              <h2 className="font-bold text-xl">Informações Gerais</h2>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Nome da Propriedade *
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
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={getInputClass(formData.description, "resize-none")}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                WhatsApp *
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
              <h2 className="font-bold text-xl">Endereço</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Rua / Logradouro *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rodovia SP-100"
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
                  placeholder="Ex: S/N"
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
                  placeholder="Ex: Zona Rural"
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
                  placeholder="Ex: Campinas"
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
                  onChange={(e) => handleAddressChange("state", e.target.value.toUpperCase())}
                  className={getInputClass(formData.address.state, "uppercase")}
                />
              </div>
            </div>
            
            <div className="mt-4 pt-2">
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Link do Google Maps (Opcional)
              </label>
              <input
                type="url"
                placeholder="Ex: https://maps.app.goo.gl/..."
                value={formData.mapsLink}
                onChange={(e) => setFormData({ ...formData, mapsLink: e.target.value })}
                className={getInputClass(formData.mapsLink, "", false)}
              />
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-2 mb-2 text-gray-900">
              <Upload size={24} strokeWidth={2.5} className="text-green-600" />
              <h2 className="font-bold text-xl">Imagens</h2>
            </div>

            <div className="space-y-3">
              <label className="block text-base font-semibold text-gray-700">Banner da Propriedade *</label>
              {formData.bannerImageUrl && (
                <div className="w-full h-36 rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-50 shadow-sm">
                  <img src={formData.bannerImageUrl} alt="Banner" className="w-full h-full object-cover" />
                </div>
              )}
              <label className={getImageLabelClass(formData.bannerImageUrl)}>
                <Upload size={20} strokeWidth={2.5} className={hasSubmitted && !formData.bannerImageUrl ? "text-red-600" : "text-green-600"} />
                <span>Escolher banner</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-base font-semibold text-gray-700">Foto do Proprietário / Logo *</label>
              {formData.ownerImageUrl ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-50 shadow-sm flex items-center justify-center">
                  <img src={formData.ownerImageUrl} alt="Owner" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`w-24 h-24 rounded-2xl border-2 bg-gray-50 flex items-center justify-center shadow-sm ${hasSubmitted && !formData.ownerImageUrl ? 'border-red-400' : 'border-gray-100'}`}>
                  <Store size={32} strokeWidth={2} className={hasSubmitted && !formData.ownerImageUrl ? "text-red-400" : "text-orange-500"} />
                </div>
              )}
              <label className={getImageLabelClass(formData.ownerImageUrl)}>
                <Upload size={20} strokeWidth={2.5} className={hasSubmitted && !formData.ownerImageUrl ? "text-red-600" : "text-green-600"} />
                <span>Escolher foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleOwnerChange}
                  className="sr-only"
                />
              </label>
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
                <span>Salvando alterações...</span>
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