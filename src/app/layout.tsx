import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'; // <--- Keep Clerk
import { Inter, Merriweather } from "next/font/google"; // <--- Use your original fonts
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

// Setup Google Fonts
const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const merriweather = Merriweather({
    weight: ['400', '700'],
    subsets: ["latin"],
    variable: '--font-serif'
});

export const metadata: Metadata = {
    title: "Community Focus of NC",
    description: "Professional Association Management in North Carolina",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // Wrap the entire app in ClerkProvider
        <ClerkProvider>
            <html lang="en">
            <body className={`${inter.variable} ${merriweather.variable} font-sans flex flex-col min-h-screen`}>
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />

            {/* Chat Widget */}
            <ChatWidget />
            </body>
            </html>
        </ClerkProvider>
    );
}