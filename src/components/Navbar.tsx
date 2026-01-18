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
            className={`fixed w-full top-0 z-50 transition-all duration-300 
            ${showSolidNav
                ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm'
                : 'bg-transparent border-b border-transparent'
            }`}
        >
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">

                {/* LOGO AREA */}
                <Link href="/" onClick={closeMenu} className="relative h-10 w-48 flex items-center">
                    <Image
                        src="/logo.jpg"  // <--- Make sure this matches your file name in /public
                        alt="Community Focus"
                        width={180}
                        height={50}
                        className={`object-contain object-left transition-all duration-300 ${
                            // If we are on the transparent background, make the logo WHITE
                            showSolidNav ? '' : 'brightness-0 invert opacity-90'
                        }`}
                        priority
                    />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-5 xl:gap-8">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`font-medium transition-colors text-sm hover:text-brand-accent
                                ${showSolidNav ? 'text-slate-600' : 'text-slate-200'}
                            `}
                        >
                            {item.label}
                        </Link>
                    ))}

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