"use client";

import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";

interface Props {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    delay?: number;
    className?: string;
    direction?: 'up' | 'left';
    stagger?: boolean;
}

export default function Reveal({
    children,
    width = "fit-content",
    delay = 0,
    className = "",
    direction = 'up',
    stagger = false,
}: Props) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-75px" });
    const mainControls = useAnimation();

    useEffect(() => {
        if (isInView) {
            mainControls.start("visible");
        }
    }, [isInView, mainControls]);

    const hiddenState = direction === 'left'
        ? { opacity: 0, x: -40 }
        : { opacity: 0, y: 75 };

    const visibleState = direction === 'left'
        ? { opacity: 1, x: 0 }
        : { opacity: 1, y: 0 };

    if (stagger) {
        return (
            <div ref={ref} className={className} style={{ position: "relative", width }}>
                <motion.div
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.12, delayChildren: delay } },
                    }}
                    initial="hidden"
                    animate={mainControls}
                    className="h-full"
                >
                    {children}
                </motion.div>
            </div>
        );
    }

    return (
        <div ref={ref} className={className} style={{ position: "relative", width, overflow: "hidden" }}>
            <motion.div
                variants={{
                    hidden: hiddenState,
                    visible: visibleState,
                }}
                initial="hidden"
                animate={mainControls}
                transition={{ duration: 0.5, delay, ease: "easeOut" }}
                className="h-full"
            >
                {children}
            </motion.div>
        </div>
    );
}

// Child item to use inside a stagger Reveal
export function RevealItem({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
