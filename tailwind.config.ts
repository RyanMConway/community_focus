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
                    dark: '#0D1F17',       // Forest Night
                    DEFAULT: '#10B981',    // Emerald
                    light: '#EFF5F2',      // Sage Mist
                    accent: '#10B981',     // Emerald — alias kept for backward compat with text-brand-accent classes
                    gold: '#D4A853',       // Warm Gold
                    canopy: '#132D1F',     // Deep Canopy
                    edge: '#1E4030',       // Canopy Edge
                    snow: '#F0F7F4',       // Snow white
                    sage: '#EFF5F2',       // Sage Mist
                },
            },
            backgroundImage: {
                'hero-gradient': 'radial-gradient(ellipse at 50% 0%, #132D1F 0%, #0D1F17 60%, #081510 100%)',
                'card-gradient': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                'emerald-shine': 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
            },
            boxShadow: {
                'glow': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
                'card': '0 10px 30px -10px rgba(0, 0, 0, 0.08)',
                'card-hover': '0 20px 40px -10px rgba(16, 185, 129, 0.12)',
                'emerald-glow': '0 0 24px rgba(16, 185, 129, 0.2)',
            },
            keyframes: {
                'shimmer-slide': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                'infinite-scroll': {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(-50%)' },
                },
                'count-up': {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'shimmer-slide': 'shimmer-slide 0.8s ease-in-out infinite',
                'infinite-scroll': 'infinite-scroll 40s linear infinite',
                'count-up': 'count-up 0.6s ease-out forwards',
            },

        },
    },
    plugins: [],
};
export default config;
