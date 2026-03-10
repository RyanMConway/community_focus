import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Inter, Outfit } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import PageCurtain from "@/components/PageCurtain";
import PageTransition from "@/components/PageTransition";

// Setup Google Fonts
const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
// Reuses --font-serif so all font-serif Tailwind classes pick up Outfit without component changes
const outfit = Outfit({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ["latin"],
    variable: '--font-serif',
});

export const metadata: Metadata = {
  title: {
    default: 'Community Focus of NC',
    template: '%s | Community Focus of NC',
  },
  description:
    'Professional HOA and community association management across the Triangle area of North Carolina. Serving 30+ communities with transparency, modern technology, and a personal touch.',
  metadataBase: new URL('https://www.communityfocusnc.com'),
  openGraph: {
    siteName: 'Community Focus of NC',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={`${inter.variable} ${outfit.variable} font-sans flex flex-col min-h-screen`}>

                    {/* 1. Add the Toaster for Admin notifications */}
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            style: {
                                background: '#1e293b',
                                color: '#fff',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#10b981',
                                    secondary: 'white',
                                },
                            },
                        }}
                    />

                    {/* Page load curtain reveal */}
                    <PageCurtain />

                    {/* Skip-to-main-content: visually hidden until focused by keyboard */}
                    <a
                        href="#main-content"
                        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-brand-dark focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:shadow-lg focus:outline-none"
                    >
                        Skip to main content
                    </a>

                    <Navbar />

                    {/* Page transition wrapper */}
                    <PageTransition>
                        <main id="main-content" tabIndex={-1} className="flex-grow focus:outline-none">
                            {children}
                        </main>

                        <Footer />
                    </PageTransition>

                    {/* 5. Restore the Chat Widget */}
                    <ChatWidget />
                </body>
            </html>
        </ClerkProvider>
    );
}