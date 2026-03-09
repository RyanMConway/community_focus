import Reveal from '@/components/Reveal';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    eyebrow?: string;
    badge?: string;
    children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, eyebrow, badge, children }: PageHeaderProps) {
    return (
        <div className="relative bg-gradient-mesh pt-32 pb-28 px-6 text-center overflow-hidden">
            {/* Animated grid texture */}
            <div className="absolute inset-0 bg-grid-white opacity-10 pointer-events-none" />

            {/* Decorative blur orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto">
                <Reveal width="100%">
                    <div className="flex flex-col items-center">
                        {eyebrow && (
                            <span className="text-brand-gold font-bold tracking-wider uppercase text-xs mb-4">
                                {eyebrow}
                            </span>
                        )}
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-lg text-blue-100/90 max-w-2xl leading-relaxed font-light">
                                {subtitle}
                            </p>
                        )}
                        {badge && (
                            <div className="mt-6 inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-blue-50 backdrop-blur-md">
                                {badge}
                            </div>
                        )}
                        {children}
                    </div>
                </Reveal>
            </div>

            {/* Wave divider — matches homepage hero */}
            <div className="absolute bottom-0 left-0 w-full leading-none">
                <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
                    <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f8fafc" />
                </svg>
            </div>
        </div>
    );
}
