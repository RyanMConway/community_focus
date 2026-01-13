"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import ShinyButton from './ShinyButton';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Add shadow/border only when scrolled
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
                    {/* Dark text on scroll, Light text on transparent hero (optional, but here we assume hero is dark so we might need logic.
                        For simplicity, let's keep text dark or white depending on design.
                        Given the hero is dark blue, let's use a trick: Force text color or assume a white nav always?
                        Actually, let's stick to the user's white nav style but make it glass.
                    */}
                    <span className={`text-xl font-serif font-bold tracking-tight transition-colors ${scrolled ? 'text-slate-800' : 'text-slate-800 md:text-white'}`}>
                        Community Focus
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {['Home', 'About Us', 'Communities', 'Services', 'Resources'].map((item) => {
                        const href = item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`;
                        return (
                            <Link
                                key={item}
                                href={href}
                                className={`font-medium transition-colors text-[15px] hover:text-brand-accent
                                    ${scrolled ? 'text-slate-600' : 'text-slate-200'}
                                `}
                            >
                                {item}
                            </Link>
                        )
                    })}

                    <ShinyButton href="/contact" className="py-2.5 px-6 text-sm">
                        Contact Us
                    </ShinyButton>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className={`md:hidden focus:outline-none ${scrolled ? 'text-slate-800' : 'text-white'}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg h-screen">
                    <div className="flex flex-col p-6 space-y-6">
                        {['Home', 'About Us', 'Communities', 'Services'].map((item) => (
                            <Link
                                key={item}
                                href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                                onClick={closeMenu}
                                className="text-slate-800 hover:text-brand font-medium text-2xl font-serif"
                            >
                                {item}
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