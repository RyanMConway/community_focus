import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Inter, Merriweather } from "next/font/google";
import { Toaster } from 'react-hot-toast'; // Kept the new Toast library
import "./globals.css";
import Navbar from "@/components/Navbar"; // Restored
import Footer from "@/components/Footer"; // Restored
import ChatWidget from "@/components/ChatWidget"; // Restored

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
        <ClerkProvider>
            <html lang="en">
                <body className={`${inter.variable} ${merriweather.variable} font-sans flex flex-col min-h-screen`}>

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

                    {/* 2. Restore the Navbar */}
                    <Navbar />

                    {/* 3. Restore the Main Content Area */}
                    <main className="flex-grow">
                        {children}
                    </main>

                    {/* 4. Restore the Footer */}
                    <Footer />

                    {/* 5. Restore the Chat Widget */}
                    <ChatWidget />
                </body>
            </html>
        </ClerkProvider>
    );
}