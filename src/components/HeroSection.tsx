"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import HomeQuestionnaire from '@/components/HomeQuestionnaire';

// Signature animation constants
const TEXT_DELAY = 0.75;
const GROUP_STAGGER = 0.18;

// Letter groups for the glow entrance animation
const HEADLINE_GROUPS = [
    { text: 'Focus on', className: 'text-brand-snow' },
    { text: 'your', className: 'text-brand-snow' },
    { text: 'Community.', className: 'text-brand' },
];

function GlowGroup({ text, className, index }: { text: string; className: string; index: number }) {
    return (
        <motion.span
            className={`inline-block ${className}`}
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{
                opacity: 1,
                filter: 'blur(0px)',
            }}
            transition={{
                duration: 0.7,
                delay: TEXT_DELAY + index * GROUP_STAGGER,
                ease: [0.16, 1, 0.3, 1],
            }}
            style={{ marginRight: '0.3em' }}
        >
            <motion.span
                initial={{ textShadow: '0 0 0px rgba(16,185,129,0)' }}
                animate={{
                    textShadow: [
                        '0 0 0px rgba(16,185,129,0)',
                        '0 0 30px rgba(16,185,129,0.7)',
                        '0 0 0px rgba(16,185,129,0)',
                    ],
                }}
                transition={{
                    duration: 1.0,
                    delay: TEXT_DELAY + index * GROUP_STAGGER,
                    ease: 'easeOut',
                    times: [0, 0.4, 1],
                }}
                className="inline-block"
            >
                {text}
            </motion.span>
        </motion.span>
    );
}

export default function HeroSection() {
    const heroRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });

    const contentOpacity = useTransform(scrollYProgress, [0.25, 0.75], [1, 0]);
    const contentY = useTransform(scrollYProgress, [0.25, 0.75], ['0%', '-8%']);

    return (
        <div
            ref={heroRef}
            className="relative pt-40 pb-40 lg:pt-48 lg:pb-48 overflow-hidden bg-brand-dark"
        >
            {/* Radial bloom — subtle depth behind headline */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 80% 60% at 50% 20%, #132D1F 0%, transparent 70%)',
                }}
            />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-grid-white opacity-5 pointer-events-none z-[1]" />

            {/* Subtle emerald horizon glow at bottom */}
            <div
                className="absolute bottom-0 left-0 w-full h-32 z-[1] pointer-events-none"
                style={{
                    background: 'linear-gradient(to top, rgba(16,185,129,0.06), transparent)',
                }}
            />

            {/* HERO CONTENT */}
            <motion.div
                style={{ opacity: contentOpacity, y: contentY }}
                className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center"
            >
                {/* Eyebrow badge */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: TEXT_DELAY - 0.2 }}
                    className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-brand/10 border border-brand/20 text-sm font-medium mb-8 backdrop-blur-md"
                >
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    <span className="text-brand-snow/80">Trusted by 30+ NC Communities</span>
                </motion.div>

                {/* SIGNATURE GLOW HEADLINE */}
                <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 tracking-tight flex flex-wrap justify-center">
                    {HEADLINE_GROUPS.map((group, i) => (
                        <GlowGroup key={group.text} {...group} index={i} />
                    ))}
                </h1>

                {/* Subtext */}
                <motion.p
                    className="text-lg md:text-xl text-brand-snow/60 max-w-2xl mx-auto mb-10 font-light leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.7,
                        delay: TEXT_DELAY + HEADLINE_GROUPS.length * GROUP_STAGGER + 0.2,
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
                        delay: TEXT_DELAY + HEADLINE_GROUPS.length * GROUP_STAGGER + 0.4,
                        ease: 'easeOut',
                    }}
                >
                    <HomeQuestionnaire />
                </motion.div>
            </motion.div>

            {/* Wave divider — fill matches Cloud White section below */}
            <div className="absolute bottom-0 left-0 w-full z-10 leading-none">
                <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
                    <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#F9FAFB" />
                </svg>
            </div>
        </div>
    );
}
