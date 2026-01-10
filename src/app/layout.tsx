import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POS System - Dashboard",
  description: "Advanced POS management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
