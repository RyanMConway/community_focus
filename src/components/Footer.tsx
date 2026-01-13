"use client"; // <--- Now a Client Component

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // <--- Hook to check current page
import { Mail, Phone, MapPin, Facebook, Linkedin, ArrowRight } from 'lucide-react';
import ShinyButton from './ShinyButton';

export default function Footer() {
    const pathname = usePathname();

    // Hide CTA on admin pages to keep the interface clean
    const showCTA = !pathname?.startsWith('/admin');

    return (
        <footer className={`relative bg-slate-900 pt-20 text-slate-300 transition-all ${showCTA ? 'mt-32' : 'mt-0'}`}>

            {/* --- FLOATING CTA CARD (Conditionally Rendered) --- */}
            {showCTA && (
                <div className="absolute -top-20 left-0 w-full px-4">
                    <div className="container mx-auto">
                        <div className="relative overflow-hidden rounded-3xl bg-brand p-6 md:p-8 shadow-2xl shadow-brand/40 flex flex-col md:flex-row items-center justify-between gap-6">

                            {/* Background Pattern on Card */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <div className="relative z-10">
                                <h2 className="text-2xl font-serif font-bold text-white mb-1">
                                    Ready to upgrade your community?
                                </h2>
                                <p className="text-blue-100 text-base">
                                    Let's discuss how we can bring transparency to your board.
                                </p>
                            </div>

                            <div className="relative z-10 flex-shrink-0">
                                <ShinyButton href="/contact" variant="secondary" className="shadow-lg py-3 px-6 text-sm">
                                    Get a Proposal <ArrowRight className="w-4 h-4 ml-2" />
                                </ShinyButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            <div className="container mx-auto px-4 pb-16 pt-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-white">
                            <div className="bg-white/10 p-1.5 rounded-lg border border-white/10">
                                <span className="font-bold text-lg">CF</span>
                            </div>
                            <span className="text-xl font-serif font-bold tracking-tight">Community Focus</span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400">
                            Professional association management dedicated to transparency, communication, and preserving property values across North Carolina.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand hover:text-white transition-all hover:scale-110">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand hover:text-white transition-all hover:scale-110">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-sm">
                            {['Home', 'About Us', 'Services', 'Communities'].map((item) => (
                                <li key={item}>
                                    <Link
                                        href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                                        className="hover:text-white hover:translate-x-1 transition-all inline-flex"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Services</h4>
                        <ul className="space-y-4 text-sm">
                            {['Financial Management', 'Property Maintenance', 'Administrative Support', 'Consulting'].map((item) => (
                                <li key={item} className="hover:text-white hover:translate-x-1 transition-all cursor-pointer inline-flex">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Contact</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-brand mt-0.5" />
                                <span>PO Box 52395<br/>Durham, NC 27717</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-brand" />
                                <a href="tel:9195649134" className="hover:text-white transition-colors">(919) 564-9134</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-brand" />
                                <a href="mailto:info@communityfocusnc.com" className="hover:text-white transition-colors">info@communityfocusnc.com</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/5 bg-black/20">
                <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} Community Focus of NC, Inc. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}