"use client";

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import HomeQuestionnaire from '@/components/HomeQuestionnaire';

// Stagger delay starts after curtain exits
const TEXT_DELAY = 0.75;
const WORD_STAGGER = 0.08;

function MaskedWord({ word, index, className = '' }: { word: string; index: number; className?: string }) {
    return (
        <span className="inline-block overflow-hidden leading-tight">
            <motion.span
                className={`inline-block ${className}`}
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{
                    duration: 0.75,
                    delay: TEXT_DELAY + index * WORD_STAGGER,
                    ease: [0.16, 1, 0.3, 1], // snappy spring-like ease
                }}
            >
                {word}
            </motion.span>
        </span>
    );
}

export default function HeroSection() {
    const heroRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });

    // Image moves upward at 30% scroll speed — creates depth
    const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

    // Fade out hero content as user scrolls past
    const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const contentY = useTransform(scrollYProgress, [0, 0.5], ['0%', '-8%']);

    const line1 = ['Focus', 'on', 'your'];

    return (
        <div
            ref={heroRef}
            className="relative pt-40 pb-40 lg:pt-48 lg:pb-48 overflow-hidden"
        >
            {/* PARALLAX BACKGROUND IMAGE */}
            <motion.div
                className="absolute inset-[-10%] z-0"
                style={{ y: imageY }}
            >
                <Image
                    src="https://images.unsplash.com/photo-1592595896551-12b371d546d5?q=80&w=2670&auto=format&fit=crop"
                    alt="Peaceful Suburban Neighborhood"
                    fill
                    priority
                    className="object-cover object-center"
                />
            </motion.div>

            {/* Animated gradient mesh overlay */}
            <div className="absolute inset-0 bg-gradient-mesh opacity-75 z-[1]" />

            {/* Grid pattern */}
            <div className="absolute inset-0 bg-grid-white opacity-10 pointer-events-none z-[1]" />

            {/* HERO CONTENT — fades + rises on scroll */}
            <motion.div
                style={{ opacity: contentOpacity, y: contentY }}
                className="relative z-10 container mx-auto px-4 text-center text-white flex flex-col items-center"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: TEXT_DELAY - 0.1 }}
                    className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-8 backdrop-blur-md shadow-lg shadow-black/5 hover:bg-white/20 transition-colors cursor-default"
                >
                    <CheckCircle2 className="w-4 h-4 text-brand-accent" />
                    <span className="text-blue-50">Trusted by 30+ NC Communities</span>
                </motion.div>

                {/* MASKED WORD-BY-WORD HEADLINE */}
                <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 tracking-tight drop-shadow-sm">
                    {/* Line 1: "Focus on your" */}
                    <span className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-2">
                        {line1.map((word, i) => (
                            <MaskedWord key={word} word={word} index={i} />
                        ))}
                    </span>

                    {/* Line 2: "Community." — gradient, longer delay */}
                    <span className="block overflow-hidden">
                        <motion.span
                            className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200"
                            initial={{ y: '110%' }}
                            animate={{ y: '0%' }}
                            transition={{
                                duration: 0.9,
                                delay: TEXT_DELAY + line1.length * WORD_STAGGER + 0.05,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                        >
                            Community.
                        </motion.span>
                    </span>
                </h1>

                {/* Subtext */}
                <motion.p
                    className="text-lg md:text-xl text-blue-100/90 max-w-2xl mx-auto mb-10 font-light leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.7,
                        delay: TEXT_DELAY + line1.length * WORD_STAGGER + 0.3,
                        ease: 'easeOut',
                    }}
                >
                    We handle the heavy lifting of association management with transparency,
                    modern technology, and a personal touch.
                </motion.p>

                {/* Questionnaire */}
                <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.7,
                        delay: TEXT_DELAY + line1.length * WORD_STAGGER + 0.5,
                        ease: 'easeOut',
                    }}
                >
                    <HomeQuestionnaire />
                </motion.div>
            </motion.div>

            {/* Wave divider */}
            <div className="absolute bottom-0 left-0 w-full z-10 leading-none">
                <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
                    <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f8fafc" />
                </svg>
            </div>
        </div>
    );
}
