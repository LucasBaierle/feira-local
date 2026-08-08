"use client";

export default function LogoutButton() {
  return (
    <a
      href="/api/auth/signout"
      className="text-sm text-gray-500 hover:text-red-500 cursor-pointer touch-manipulation select-none"
    >
      Sair
    </a>
  );
}