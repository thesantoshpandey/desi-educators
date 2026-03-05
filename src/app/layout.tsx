import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Karla } from "next/font/google";
import "./globals.css";

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.desieducators.com'),
  title: {
    default: "Desi Educators | Crack NEET with Concept-First Learning",
    template: "%s | Desi Educators"
  },
  description: "Best NEET preparation platform with notes, videos, and tests. Master concepts with Desi Educators.",
  keywords: ["NEET", "NEET Prep", "Medical Entrance", "Biology", "Physics", "Chemistry", "Desi Educators"],
  openGraph: {
    title: "Desi Educators | Crack NEET with Concept-First Learning",
    description: "Best NEET preparation platform with notes, videos, and tests.",
    url: 'https://www.desieducators.com',
    siteName: 'Desi Educators',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/logo-v4.png', // Fallback to logo if no specific OG image
        width: 800,
        height: 600,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Desi Educators",
    description: "Crack NEET with Concept-First Learning",
    images: ['/logo-v4.png'],
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Placeholder as requested
  },
  icons: {
    icon: '/logo-v4.png',
    apple: '/apple-logo-v4.png',
    shortcut: '/favicon-v4.ico',
  },
  manifest: '/manifest.json',
};

import { Navbar, Footer } from "@/components/layout";
import { AuthProvider } from "@/context/AuthContext";
import { ContentProvider } from "@/context/ContentContext";
import { CartProvider } from "@/context/CartContext";
import { ProductProvider } from "@/context/ProductContext";
import { EpisodePlayerProvider } from "@/context/EpisodePlayerContext";
import { MiniPlayer } from "@/components/player";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${karla.variable} ${cormorant.variable}`} suppressHydrationWarning>
        <AuthProvider>
          <ContentProvider>
            <ProductProvider>
              <CartProvider>
                <EpisodePlayerProvider>
                  <Navbar />
                  <main>
                    {children}
                  </main>
                  <Footer />
                  <MiniPlayer />
                </EpisodePlayerProvider>
              </CartProvider>
            </ProductProvider>
          </ContentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
