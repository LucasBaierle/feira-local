"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";

export default function HeaderInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const isPWA = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    
    if (isPWA) return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    
    setDeferredPrompt(null);
  };

  if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="relative w-11 h-11 flex items-center justify-center bg-green-50 text-green-700 rounded-xl border border-green-200 hover:bg-green-100 active:scale-95 transition-all cursor-pointer shadow-sm"
      aria-label="Instalar App"
    >
      <Download size={22} strokeWidth={2.5} />
      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
    </button>
  );
}