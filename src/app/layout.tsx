import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'; // <--- IMPORT THIS
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "Community Focus of NC",
    description: "Modern HOA Management",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // WRAP EVERYTHING IN CLERK PROVIDER
        <ClerkProvider>
            <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
            <Navbar />
            {children}
            <ChatWidget />
            <Footer />
            </body>
            </html>
        </ClerkProvider>
    );
}