import Link from 'next/link';

interface Props {
    href: string;
    children: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary';
}

export default function ShinyButton({ href, children, className = "", variant = 'primary' }: Props) {

    // Define base styles that apply to both variants
    const baseStyles = "relative group overflow-hidden font-bold py-4 px-8 rounded-full shadow-glow hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 inline-block";

    // Define color-specific styles
    const variants = {
        primary: "bg-brand text-white",
        secondary: "bg-white text-brand"
    };

    return (
        <Link
            href={href}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {/* THE SHINE LAYER
                - Adjusted for the secondary variant to be subtle gray instead of white
            */}
            <div className={`absolute inset-0 -translate-x-full group-hover:animate-shimmer-slide -skew-x-12 z-10 w-full h-full 
                ${variant === 'primary'
                ? 'bg-gradient-to-r from-transparent via-white/70 to-transparent'
                : 'bg-gradient-to-r from-transparent via-slate-200/50 to-transparent' // Darker shine for white button
            }
            `}></div>

            {/* The Text */}
            <span className="relative z-20">{children}</span>
        </Link>
    );
}