import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast'; // IMPORTED

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: "Community Focus of NC",
  description: "Premier Community Association Management in Durham, NC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
        <body className={inter.className}>
          {/* TOASTER COMPONENT ADDED HERE */}
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
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}