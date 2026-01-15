"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import ShinyButton from './ShinyButton';

const NAV_ITEMS = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Communities', href: '/communities' },
    { label: 'Services', href: '/services' },
    { label: 'Vendors', href: '/vendors' }, // <--- NEW LINK
    { label: 'Resources', href: '/resources' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const closeMenu = () => setIsOpen(false);

    return (
        <nav
            className={`fixed w-full top-0 z-50 transition-all duration-300 
            ${scrolled
                ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm'
                : 'bg-transparent border-b border-transparent'
            }`}
        >
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">

                {/* Logo Area */}
                <Link href="/" onClick={closeMenu} className="flex items-center gap-2 group">
                    <div className="bg-brand text-white p-2 rounded-xl font-bold text-xl shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform">
                        CF
                    </div>
                    <span className={`text-xl font-serif font-bold tracking-tight transition-colors ${scrolled ? 'text-slate-800' : 'text-slate-800 md:text-white'}`}>
                        Community Focus
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-8">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`font-medium transition-colors text-[15px] hover:text-brand-accent
                                ${scrolled ? 'text-slate-600' : 'text-slate-200'}
                            `}
                        >
                            {item.label}
                        </Link>
                    ))}

                    <ShinyButton href="/contact" className="py-2.5 px-6 text-sm">
                        Contact Us
                    </ShinyButton>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className={`lg:hidden focus:outline-none ${scrolled ? 'text-slate-800' : 'text-slate-800 md:text-white'}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="lg:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg h-screen top-20 left-0">
                    <div className="flex flex-col p-6 space-y-6">
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