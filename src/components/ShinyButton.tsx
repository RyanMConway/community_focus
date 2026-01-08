import Link from 'next/link';

interface Props {
    href: string;
    children: React.ReactNode;
    className?: string;
}

export default function ShinyButton({ href, children, className = "" }: Props) {
    return (
        <Link
            href={href}
            className={`relative group overflow-hidden bg-brand text-white font-bold py-4 px-8 rounded-full shadow-glow hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 inline-block ${className}`}
        >
            {/* THE SHINE LAYER
          - via-white/70: Much brighter white
          - -skew-x-12: Tilts the reflection for a "glass" look
          - animate-shimmer-slide: Uses our new config animation
      */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer-slide bg-gradient-to-r from-transparent via-white/70 to-transparent -skew-x-12 z-10 w-full h-full"></div>

            {/* The Text - z-20 ensures it stays on top of the shine */}
            <span className="relative z-20">{children}</span>
        </Link>
    );
}