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
                ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/40 shadow-[0_1px_24px_0_rgba(0,0,0,0.06)]'
                : 'bg-transparent border-b border-transparent'
            }`}
        >
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">

                {/* LOGO AREA - Hybrid Switcher */}
                <Link href="/" onClick={closeMenu} className="relative h-10 w-auto min-w-[200px] flex items-center group">

                    {/* STATE 1: Logo Image (Visible ONLY when Scrolled/White BG) */}
                    {/* The white background of the JPG/PNG will blend with the white navbar. */}
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 transition-all duration-300 origin-left
                        ${showSolidNav ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
                    `}>
                        <Image
                            src="/logo.jpg"
                            alt="Community Focus"
                            width={180}
                            height={50}
                            className="h-10 w-auto object-contain object-left"
                            priority
                        />
                    </div>

                    {/* STATE 2: Text Brand (Visible ONLY when Transparent/Blue BG) */}
                    {/* This ensures no "White Box" boxiness on the blue hero. */}
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-3 transition-all duration-300 origin-left
                        ${showSolidNav ? 'opacity-0 scale-95 invisible' : 'opacity-100 scale-100 visible'}
                    `}>
                        <div className="bg-white/15 backdrop-blur-md p-2 rounded-lg border border-white/20 shadow-sm group-hover:bg-white/25 transition-colors">
                            <span className="font-bold text-white text-lg leading-none tracking-tight">CF</span>
                        </div>
                        <span className="text-xl font-serif font-bold text-white tracking-wide drop-shadow-sm whitespace-nowrap">
                            Community Focus
                        </span>
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
                                        ? showSolidNav ? 'text-brand' : 'text-white'
                                        : showSolidNav ? 'text-slate-600 hover:text-brand' : 'text-slate-200 hover:text-white'
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
                    className={`lg:hidden focus:outline-none ${showSolidNav ? 'text-slate-800' : 'text-slate-800 md:text-white'}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="lg:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg h-screen top-20 left-0">
                    <div className="flex flex-col p-6 space-y-6 pt-12">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={closeMenu}
                                className="text-slate-800 hover:text-brand font-medium text-2xl font-serif"
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