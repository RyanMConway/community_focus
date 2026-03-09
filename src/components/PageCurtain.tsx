"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageCurtain() {
    const [visible, setVisible] = useState(true);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-dark pointer-events-none"
                    initial={{ y: '0%' }}
                    animate={{ y: '-105%' }}
                    transition={{
                        duration: 0.95,
                        delay: 0.15,
                        ease: [0.76, 0, 0.24, 1],
                    }}
                    onAnimationComplete={() => setVisible(false)}
                >
                    {/* Monogram — fades out as curtain lifts */}
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 0.25, delay: 0.1 }}
                        className="flex flex-col items-center gap-3 select-none"
                    >
                        <Image
                            src="/magnifying-glass-icon.jpg"
                            alt="Community Focus of NC"
                            width={72}
                            height={72}
                            className="w-18 h-18 object-contain invert mix-blend-screen"
                            priority
                        />
                        <div className="flex gap-0.5">
                            {['C','o','m','m','u','n','i','t','y',' ','F','o','c','u','s'].map((ch, i) => (
                                <motion.span
                                    key={i}
                                    className="text-white/40 text-xs tracking-widest font-medium"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03, duration: 0.2 }}
                                >
                                    {ch === ' ' ? '\u00A0' : ch}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Bottom gold accent line */}
                    <motion.div
                        className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
