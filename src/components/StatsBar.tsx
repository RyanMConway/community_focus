"use client";

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

const STATS = [
    { value: 30, suffix: '+', label: 'Communities Served', description: 'Across North Carolina' },
    { value: 15, suffix: '+', label: 'Years of Experience', description: 'Trusted since 2009' },
    { value: 99, suffix: '%', label: 'Client Retention', description: 'Year over year' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    useEffect(() => {
        if (!isInView) return;

        const duration = 1800;
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            // Ease-out: slow down as we approach the target
            const progress = 1 - Math.pow(1 - step / steps, 3);
            current = Math.round(progress * value);
            setDisplay(current);
            if (step >= steps) {
                setDisplay(value);
                clearInterval(timer);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [isInView, value]);

    return (
        <span ref={ref} className="tabular-nums">
            {display}{suffix}
        </span>
    );
}

export default function StatsBar() {
    return (
        <div className="relative bg-brand-dark py-20 overflow-hidden">
            {/* Animated gradient mesh background */}
            <div className="absolute inset-0 bg-gradient-mesh opacity-60" />

            {/* Dot pattern */}
            <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />

            {/* Gold accent line at top */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />

            <div className="relative z-10 container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-center">
                    {STATS.map((stat, i) => (
                        <div key={i} className="group">
                            <div className="text-5xl md:text-6xl font-bold text-brand-gold mb-2 tracking-tight">
                                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                            </div>
                            <div className="text-lg font-semibold text-brand-snow mb-1">{stat.label}</div>
                            <div className="text-sm text-brand-snow/60">{stat.description}</div>

                            {/* Gold underline that grows on hover */}
                            <div className="mx-auto mt-4 h-0.5 w-8 bg-brand-gold/40 group-hover:w-16 transition-all duration-500 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Gold accent line at bottom */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />
        </div>
    );
}
