"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import ShinyButton from './ShinyButton';

const NAV_ITEMS = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Communities', href: '/communities' },
    { label: 'Services', href: '/services' },
    { label: 'Vendors', href: '/vendors' },
    { label: 'Resources', href: '/resources' },
    { label: 'Reviews', href: '/reviews' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    const isHomePage = pathname === '/';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const closeMenu = () => setIsOpen(false);

    // Logic: Show solid (white) nav if scrolled OR if not on the home page
    const showSolidNav = scrolled || !isHomePage;

    return (
        <nav
            className={`fixed w-full top-0 z-50 transition-all duration-500
            ${showSolidNav
                ? 'bg-brand-dark/95 backdrop-blur-xl border-b border-brand-edge shadow-lg'
                : 'bg-transparent border-b border-transparent'
            }`}
        >
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">

                {/* LOGO AREA - Hybrid Switcher */}
                <Link href="/" onClick={closeMenu} className="relative h-14 w-auto min-w-[220px] flex items-center group">

                    {/* Solid nav state: white logo on dark green nav */}
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 transition-all duration-300 origin-left
                        ${showSolidNav ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
                    `}>
                        <Image
                            src="/logo.png"
                            alt="Community Focus of NC"
                            width={220}
                            height={60}
                            className="h-14 w-auto object-contain object-left brightness-0 invert drop-shadow-sm"
                            priority
                        />
                    </div>

                    {/* Transparent/hero state: white logo — no white box on blue hero */}
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 transition-all duration-300 origin-left
                        ${showSolidNav ? 'opacity-0 scale-95 invisible' : 'opacity-100 scale-100 visible'}
                    `}>
                        <Image
                            src="/logo.png"
                            alt="Community Focus of NC"
                            width={220}
                            height={60}
                            className="h-14 w-auto object-contain object-left brightness-0 invert drop-shadow-sm"
                            priority
                        />
                    </div>

                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-5 xl:gap-8">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`relative font-medium transition-colors text-sm group
                                    ${isActive
                                        ? 'text-brand'
                                        : showSolidNav ? 'text-brand-snow/70 hover:text-brand-snow' : 'text-slate-200 hover:text-white'
                                    }
                                `}
                            >
                                {item.label}
                                <span className={`absolute -bottom-1 left-0 h-0.5 bg-brand rounded-full transition-all duration-300
                                    ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}
                                `} />
                            </Link>
                        );
                    })}

                    <ShinyButton href="/contact" className="py-2.5 px-5 text-sm">
                        Contact Us
                    </ShinyButton>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className={`lg:hidden focus:outline-none ${showSolidNav ? 'text-brand-snow' : 'text-slate-800 md:text-white'}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="lg:hidden bg-brand-dark border-t border-brand-edge absolute w-full shadow-lg h-screen top-20 left-0">
                    <div className="flex flex-col p-6 space-y-6 pt-12">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={closeMenu}
                                className="text-brand-snow hover:text-brand font-medium text-2xl font-serif"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div onClick={closeMenu} className="pt-4">
                            <ShinyButton href="/contact" className="w-full text-center justify-center flex">
                                Contact Us
                            </ShinyButton>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}