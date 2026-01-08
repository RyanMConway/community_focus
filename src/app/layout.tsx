import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget"; // <--- IMPORT

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
        <html lang="en">
        <body className={`${inter.variable} ${merriweather.variable} font-sans flex flex-col min-h-screen`}>
        <Navbar />
        <main className="flex-grow">
            {children}
        </main>
        <Footer />

        {/* ADD WIDGET HERE */}
        <ChatWidget />
        </body>
        </html>
    );
}