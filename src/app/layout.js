import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Feira Local",
  description: "Plataforma de produtos e produtores rurais",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/leaf.ico",
    shortcut: "/icons/leaf.ico",
    apple: "/icons/leaf.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#16a34a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}