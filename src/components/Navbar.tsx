"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import ShinyButton from './ShinyButton'; // <--- Import the Shiny Button

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    // Helper to close menu when a link is clicked
    const closeMenu = () => setIsOpen(false);

    return (
        <nav className="fixed w-full top-0 z-50 transition-all duration-300 bg-white border-b border-gray-100 shadow-sm">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">

                {/* Logo Area */}
                <Link href="/" onClick={closeMenu} className="flex items-center gap-2 group">
                    <div className="bg-brand text-white p-2 rounded-xl font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
                        CF
                    </div>
                    <span className="text-xl font-serif font-bold text-slate-800 tracking-tight">
                        Community Focus
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-slate-600 hover:text-brand font-medium transition-colors text-[15px]">
                        Home
                    </Link>
                    <Link href="/about" className="text-slate-600 hover:text-brand font-medium transition-colors text-[15px]">
                        About Us
                    </Link>
                    <Link href="/communities" className="text-slate-600 hover:text-brand font-medium transition-colors text-[15px]">
                        Communities
                    </Link>
                    <Link href="/services" className="text-slate-600 hover:text-brand font-medium transition-colors text-[15px]">
                        Services
                    </Link>
                    <Link href="/resources" className="text-slate-600 hover:text-brand font-medium transition-colors">
                        Resources
                    </Link>

                    {/* UPDATED: Uses ShinyButton for Desktop */}
                    <ShinyButton href="/contact" className="py-2.5 px-6 text-sm">
                        Contact Us
                    </ShinyButton>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-600 hover:text-brand focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
                    <div className="flex flex-col p-4 space-y-4">
                        <Link
                            href="/"
                            onClick={closeMenu}
                            className="text-slate-600 hover:text-brand font-medium text-lg py-2 border-b border-gray-50"
                        >
                            Home
                        </Link>
                        <Link
                            href="/about"
                            onClick={closeMenu}
                            className="text-slate-600 hover:text-brand font-medium text-lg py-2 border-b border-gray-50"
                        >
                            About Us
                        </Link>
                        <Link
                            href="/communities"
                            onClick={closeMenu}
                            className="text-slate-600 hover:text-brand font-medium text-lg py-2 border-b border-gray-50"
                        >
                            Communities
                        </Link>
                        <Link
                            href="/services"
                            onClick={closeMenu}
                            className="text-slate-600 hover:text-brand font-medium text-lg py-2 border-b border-gray-50"
                        >
                            Services
                        </Link>

                        {/* UPDATED: Uses ShinyButton for Mobile (Wrapped in div to handle onClick close) */}
                        <div onClick={closeMenu} className="pt-2">
                            <ShinyButton href="/contact" className="w-full text-center">
                                Contact Us
                            </ShinyButton>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}