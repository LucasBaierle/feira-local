import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Property from "@/models/Property";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Store, Phone, Leaf } from "lucide-react";
import AddToCartDetailButton from "@/components/AddToCartDetailButton";

export const dynamic = "force-dynamic";

export default async function ProdutoPage({ params }) {
  const resolvedParams = await params;
  
  await connectDB();

  const product = await Product.findById(resolvedParams.id)
    .populate("property")
    .lean();

  if (!product) {
    notFound();
  }

  const serializedProduct = {
    _id: product._id.toString(),
    name: product.name,
    price: product.price,
    unit: product.unit,
    imageUrl: product.imageUrl,
    property: product.property ? {
      _id: product.property._id.toString(),
      name: product.property.name,
    } : null
  };

  const getFormattedAddress = (address) => {
    if (!address) return "";
    
    const { street, number, neighborhood, city, state, zipCode } = address;
    
    const streetPart = street && number ? `${street}, ${number}` : street || number || "";
    const cityStatePart = city && state ? `${city} - ${state}` : city || state || "";
    
    return [streetPart, neighborhood, cityStatePart, zipCode]
      .filter(Boolean)
      .join(" • "); 
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

  const addressString = typeof product.property?.address === "object" 
    ? getFormattedAddress(product.property.address) 
    : product.property?.city || "";

  const mapsHref = product.property?.mapsLink
    ? product.property.mapsLink
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}`;

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20 md:p-8 md:pb-24">
      <Link href="/buscar-produtos" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para os produtos
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        {product.imageUrl ? (
          <div className="w-full h-64 md:h-96 bg-gray-50 border-b border-gray-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-64 md:h-96 bg-gray-50 border-b border-gray-100 flex items-center justify-center">
            <Leaf size={64} strokeWidth={1.5} className="text-green-200" />
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">
            <div className="flex-1">
              <span className="inline-block text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                {product.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900">{product.name}</h1>
              <p className="text-2xl md:text-3xl font-black text-green-700 mt-2">
                R$ {product.price.toFixed(2)} <span className="text-base md:text-lg text-gray-500 font-medium">/ {product.unit}</span>
              </p>
            </div>
            
            <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
              <AddToCartDetailButton product={serializedProduct} />
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Descrição do Produto</h2>
            <p className="text-gray-600 whitespace-pre-line leading-relaxed text-base font-medium">
              {product.description || "Nenhuma descrição detalhada fornecida para este produto."}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 md:h-40 bg-gray-100 relative border-b border-gray-100">
          {product.property?.bannerImageUrl ? (
            <img
              src={product.property.bannerImageUrl}
              alt="Banner da Propriedade"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">
              Sem banner
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16 md:-mt-20 mb-6 relative z-10">
            <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-2xl border-4 border-white shadow-md overflow-hidden shrink-0 flex items-center justify-center">
              {product.property?.ownerImageUrl ? (
                <img
                  src={product.property.ownerImageUrl}
                  alt="Proprietário"
                  className="w-full h-full object-cover"
                />
              ) : (
                 <Store size={40} strokeWidth={2} className="text-orange-500" />
              )}
            </div>
            <div className="flex-1 min-w-0 mt-2 md:mt-0 mb-1">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Produzido por</h2>
              <h3 className="text-2xl font-black text-gray-900 truncate">{product.property?.name || "Produtor Local"}</h3>
            </div>
          </div>

          <p className="text-gray-600 text-base font-medium leading-relaxed mb-8">
            {product.property?.description || "Nenhuma descrição informada sobre a propriedade."}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-4">
              <div className="bg-green-100 text-green-700 p-2.5 rounded-xl shrink-0">
                <Phone size={22} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">WhatsApp</p>
                {product.property?.phone ? (
                  <a
                    href={`https://wa.me/55${product.property.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 hover:underline font-bold text-base block truncate"
                  >
                    {formatPhone(product.property.phone)}
                  </a>
                ) : (
                  <span className="text-gray-400 font-medium text-sm block">Não informado</span>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-4">
              <div className="bg-blue-100 text-blue-700 p-2.5 rounded-xl shrink-0">
                <MapPin size={22} strokeWidth={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Endereço</p>
                {addressString ? (
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 hover:underline font-bold text-sm block leading-relaxed"
                  >
                    {addressString}
                  </a>
                ) : (
                  <span className="text-gray-400 font-medium text-sm block">Não informado</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}