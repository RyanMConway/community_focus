import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: '#0f172a',
                    DEFAULT: '#2563eb', // Creates 'bg-brand'
                    light: '#eff6ff',
                    accent: '#38bdf8',
                },
            },
            backgroundImage: {
                'hero-gradient': 'linear-gradient(to right bottom, #0f172a, #1e3a8a, #1e40af)',
                'card-gradient': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                'blue-shine': 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
            },
            boxShadow: {
                'glow': '0 4px 20px -2px rgba(37, 99, 235, 0.2)',
                'card': '0 10px 40px -10px rgba(0,0,0,0.05)',
            },
            // --- ANIMATION CONFIG ---
            keyframes: {
                'shimmer-slide': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
            },
            animation: {
                // Runs for 0.8s when triggered
                'shimmer-slide': 'shimmer-slide 0.8s ease-in-out infinite',
            },
        },
    },
    plugins: [],
};
export default config;