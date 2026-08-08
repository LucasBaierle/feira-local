import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3, Package, ClipboardList, Phone, MapPin, Store } from "lucide-react";

export default async function MinhaPropriedadePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  await connectDB();
  
  const property = await Property.findOne({ user: session.user.id }).lean();

  if (!property) {
    redirect("/cadastrar-propriedade");
  }

  const getFormattedAddress = (address) => {
    if (!address) return "";
    
    const { street, number, neighborhood, city, state, zipCode } = address;
    
    const streetPart = street && number ? `${street}, ${number}` : street || number || "";
    const cityStatePart = city && state ? `${city} - ${state}` : city || state || "";
    
    const fullAddress = [streetPart, neighborhood, cityStatePart, zipCode]
      .filter(Boolean)
      .join(" • "); 
      
    return fullAddress;
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

  const addressString = typeof property.address === "object" 
    ? getFormattedAddress(property.address) 
    : property.city || "";

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-12">
      <div className="max-w-lg mx-auto space-y-6">
        <header className="pt-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-green-700 hover:underline font-medium w-fit active:scale-95 transition-transform"
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
            <span className="text-base">Voltar</span>
          </Link>
        </header>

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="h-40 bg-gray-100 relative">
            {property.bannerImageUrl ? (
              <img
                src={property.bannerImageUrl}
                alt="Banner da Propriedade"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">
                Nenhum banner cadastrado
              </div>
            )}
          </div>

          <div className="px-5 pb-6">
            <div className="flex justify-between items-end -mt-12 mb-4 relative z-10">
              <div className="border-4 border-white rounded-2xl bg-white h-24 w-24 overflow-hidden shadow-md shrink-0 flex items-center justify-center">
                {property.ownerImageUrl ? (
                  <img
                    src={property.ownerImageUrl}
                    alt="Proprietário"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store size={40} strokeWidth={2} className="text-orange-500" />
                )}
              </div>

              <Link
                href="/editar-propriedade"
                className="flex items-center gap-2 bg-white text-green-700 border-2 border-green-100 px-4 py-2.5 rounded-xl font-bold hover:bg-green-50 active:scale-95 transition-all text-sm shadow-sm"
              >
                <Edit3 size={18} strokeWidth={2.5} />
                <span>Editar Dados</span>
              </Link>
            </div>

            <div>
              <h1 className="text-2xl font-black text-gray-900">{property.name}</h1>
              <p className="text-gray-600 text-sm mt-1 font-medium leading-relaxed">
                {property.description || "Nenhuma descrição informada para esta propriedade."}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Gerenciar Painel</h2>
              
              <div className="flex flex-col gap-3">
                <Link
                  href="/meus-produtos"
                  className="bg-green-50 p-5 rounded-2xl border border-green-100 shadow-sm hover:border-green-300 transition-all active:scale-95 flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 bg-white rounded-xl shadow-sm text-green-700 flex items-center justify-center shrink-0 border border-green-100">
                    <Package size={28} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-green-900 text-lg">Meus Produtos</h3>
                    <p className="text-green-700 text-sm font-medium mt-0.5">Gerenciar estoque e preços</p>
                  </div>
                </Link>
                
                <Link
                  href="/minha-propriedade/pedidos"
                  className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-sm hover:border-blue-300 transition-all active:scale-95 flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 bg-white rounded-xl shadow-sm text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                    <ClipboardList size={28} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-blue-900 text-lg">Pedidos Recebidos</h3>
                    <p className="text-blue-700 text-sm font-medium mt-0.5">Acompanhar solicitações</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Informações e Contato</h2>
              
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                  <Phone size={20} strokeWidth={2.5} className="text-green-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm">WhatsApp</h3>
                    {property.phone ? (
                      <a
                        href={`https://wa.me/55${property.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-700 hover:underline font-bold text-sm block mt-0.5 truncate"
                      >
                        {formatPhone(property.phone)}
                      </a>
                    ) : (
                      <span className="text-gray-400 font-medium text-sm block mt-0.5">Não informado</span>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                  <MapPin size={20} strokeWidth={2.5} className="text-green-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 text-sm">Endereço</h3>
                    {addressString ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-700 hover:underline font-medium text-sm block mt-0.5 leading-relaxed"
                      >
                        {addressString}
                      </a>
                    ) : (
                      <span className="text-gray-400 font-medium text-sm block mt-0.5">Não informado</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}