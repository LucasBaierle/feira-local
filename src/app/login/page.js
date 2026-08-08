"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { Leaf, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center relative">
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2 text-green-700 hover:underline font-medium p-2 active:scale-95 transition-transform">
          <ArrowLeft size={24} strokeWidth={2.5} />
          <span className="text-lg">Voltar</span>
        </Link>
      </div>

      <div className="text-center mb-10 w-full max-w-sm">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-200">
          <Leaf size={48} strokeWidth={2} className="text-green-700" />
        </div>

        <h1 className="text-3xl font-black text-gray-900">
          Feira Local
        </h1>

        <p className="text-gray-600 mt-3 text-lg font-medium">
          Entre para comprar e vender produtos direto de quem planta.
        </p>
      </div>

      <div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <button
          onClick={() =>
            signIn("google", {
              callbackUrl: "/"
            })
          }
          className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 active:scale-95 transition-all shadow-sm"
        >
          Entrar com Google
        </button>
      </div>
    </main>
  );
}