"use client";

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface CommunityHeroProps {
    name: string;
    city?: string | null;
    description?: string | null;
    image_url?: string | null;
}

export default function CommunityHero({ name, city, description, image_url }: CommunityHeroProps) {
    const heroRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });

    const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

    return (
        <div ref={heroRef} className="relative h-[450px] w-full flex items-center justify-center overflow-hidden bg-brand-dark">
            {/* Parallax background */}
            {image_url ? (
                <motion.div className="absolute inset-[-10%] z-0" style={{ y: imageY }}>
                    <Image
                        src={image_url}
                        alt={name}
                        fill
                        className="object-cover"
                        priority
                    />
                </motion.div>
            ) : (
                <div className="absolute inset-0 bg-hero-gradient z-0" />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/20 z-[1]" />
            {/* Grid texture */}
            <div className="absolute inset-0 bg-grid-white opacity-10 pointer-events-none z-[1]" />

            {/* Animated content */}
            <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
                <motion.div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-6 backdrop-blur-md"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <MapPin className="w-3 h-3 text-brand-accent" />
                    <span className="uppercase tracking-wider">{city || 'North Carolina'}</span>
                </motion.div>

                <motion.h1
                    className="text-5xl md:text-6xl font-serif font-bold mb-6 drop-shadow-lg tracking-tight"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {name}
                </motion.h1>

                {description && (
                    <motion.p
                        className="text-xl text-blue-50/90 max-w-2xl mx-auto leading-relaxed font-light"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.35 }}
                    >
                        {description}
                    </motion.p>
                )}
            </div>
        </div>
    );
}
