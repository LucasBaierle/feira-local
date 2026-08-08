"use client";

import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="w-full bg-green-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-green-700 active:scale-95 transition-all"
    >
      Entrar no Aplicativo
    </button>
  );
}