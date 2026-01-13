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
                    dark: '#0B1120', // Darker, richer slate
                    DEFAULT: '#2563eb',
                    light: '#eff6ff',
                    accent: '#38bdf8',
                },
            },
            backgroundImage: {
                // More complex, rich gradient for the hero
                'hero-gradient': 'radial-gradient(circle at 50% 0%, #1e40af 0%, #0f172a 60%, #020617 100%)',
                'card-gradient': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                'blue-shine': 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
            },
            boxShadow: {
                // Colored shadows create a more premium feel than gray ones
                'glow': '0 0 20px -5px rgba(37, 99, 235, 0.4)',
                'card': '0 10px 30px -10px rgba(0,0,0,0.08)',
                'card-hover': '0 20px 40px -10px rgba(37, 99, 235, 0.1)',
            },
            keyframes: {
                'shimmer-slide': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'float-delayed': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-15px)' },
                }
            },
            animation: {
                'shimmer-slide': 'shimmer-slide 0.8s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float-delayed 7s ease-in-out infinite 1s',
            },
        },
    },
    plugins: [],
};
export default config;