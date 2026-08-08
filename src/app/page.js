import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import CartButton from "@/components/CartButton";
import LoginButton from "@/components/LoginButton";
import HeaderInstallButton from "@/components/HeaderInstallButton";
import Link from "next/link";
import { Store, ShoppingBag, Tractor, ChevronRight, Leaf } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  let hasProperty = false;

  if (session?.user?.id) {
    await connectDB();
    const property = await Property.findOne({ user: session.user.id }).lean();
    if (property) {
      hasProperty = true;
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto space-y-5">
        
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-2 text-green-700">
            <Leaf size={28} strokeWidth={2.5} />
            <span className="text-2xl font-black tracking-tight">Feira Local</span>
          </div>
          
          <div className="flex items-center gap-2">
            <HeaderInstallButton />
            <CartButton session={session} />
          </div>
        </div>

        <header className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden shrink-0 border-2 border-green-100">
              {session?.user?.avatarUrl || session?.user?.image ? (
                <img
                  src={session.user.avatarUrl || session.user.image}
                  alt="Usuário"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {session ? `Olá, ${session.user.name?.split(" ")[0]}` : "Bem-vindo"}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {session ? "O que você precisa hoje?" : "Entre para comprar ou vender"}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            {session ? (
              <>
                <Link
                  href="/perfil"
                  className="flex-1 bg-green-50 text-green-700 text-center py-2.5 rounded-xl font-semibold text-sm hover:bg-green-100 active:scale-95 transition-all"
                >
                  Meu Cadastro
                </Link>
                <a
                  href="/api/auth/signout"
                  className="flex-1 bg-gray-50 text-gray-600 text-center py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-100 active:scale-95 transition-all"
                >
                  Sair
                </a>
              </>
            ) : (
              <LoginButton />
            )}
          </div>
        </header>

        <div className="space-y-4 pt-2 pb-8">
          <Link
            href="/buscar-produtos"
            className="flex items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-green-500 hover:shadow-md transition-all active:scale-95"
          >
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center shrink-0">
              <Store size={32} strokeWidth={2} />
            </div>
            <div className="ml-5 flex-1">
              <h2 className="text-xl font-bold text-gray-900">Comprar</h2>
              <p className="text-gray-500 text-base mt-1">Ir para a feira</p>
            </div>
            <ChevronRight size={24} className="text-gray-400 shrink-0" />
          </Link>

          <Link
            href={session ? "/meus-pedidos" : "/login"}
            className="flex items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all active:scale-95"
          >
            <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center shrink-0">
              <ShoppingBag size={32} strokeWidth={2} />
            </div>
            <div className="ml-5 flex-1">
              <h2 className="text-xl font-bold text-gray-900">Minhas Sacolas</h2>
              <p className="text-gray-500 text-base mt-1">Ver minhas compras</p>
            </div>
            <ChevronRight size={24} className="text-gray-400 shrink-0" />
          </Link>

          <Link
            href={hasProperty ? "/minha-propriedade" : session ? "/cadastrar-propriedade" : "/login"}
            className="flex items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-orange-500 hover:shadow-md transition-all active:scale-95"
          >
            <div className="w-16 h-16 bg-orange-100 text-orange-700 rounded-2xl flex items-center justify-center shrink-0">
              <Tractor size={32} strokeWidth={2} />
            </div>
            <div className="ml-5 flex-1">
              <h2 className="text-xl font-bold text-gray-900">Minha Propriedade</h2>
              <p className="text-gray-500 text-base mt-1">{hasProperty ? "Gerenciar meus produtos" : "Cadastrar minha propriedade"}</p>
            </div>
            <ChevronRight size={24} className="text-gray-400 shrink-0" />
          </Link>
        </div>
      </div>
    </main>
  );
}