import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"; // Use Inter as requested
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Desi Educators | Crack NEET with Concept-First Learning",
  description: "Best NEET preparation platform with notes, videos, and tests.",
  icons: {
    icon: '/icon.png?v=2',
    apple: '/apple-icon.png?v=2',
  },
};

import { Navbar, Footer } from "@/components/layout";
import { AuthProvider } from "@/context/AuthContext";
import { ContentProvider } from "@/context/ContentContext";
import { CartProvider } from "@/context/CartContext";
import { ProductProvider } from "@/context/ProductContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable}`} suppressHydrationWarning>
        <AuthProvider>
          <ContentProvider>
            <ProductProvider>
              <CartProvider>
                <Navbar />
                <main style={{ minHeight: 'calc(100vh - 64px - 300px)' }}>
                  {children}
                </main>
                <Footer />
              </CartProvider>
            </ProductProvider>
          </ContentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
