import Link from 'next/link';
import { Building2, Mail, Phone, MapPin, Facebook, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 relative overflow-hidden">
            {/* Background Pattern - Subtle Dots */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            {/* Top Border Gradient */}
            <div className="h-1 w-full bg-gradient-to-r from-brand-dark via-brand-DEFAULT to-brand-accent"></div>

            <div className="container mx-auto px-4 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-white">
                            <div className="bg-brand-DEFAULT p-1.5 rounded-lg">
                                <span className="font-bold text-lg">CF</span>
                            </div>
                            <span className="text-xl font-serif font-bold tracking-tight">Community Focus</span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400">
                            Professional association management dedicated to transparency, communication, and preserving property values across North Carolina.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-DEFAULT hover:text-white transition-all">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-DEFAULT hover:text-white transition-all">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/" className="hover:text-brand-accent transition-colors flex items-center gap-2">Home</Link></li>
                            <li><Link href="/about" className="hover:text-brand-accent transition-colors flex items-center gap-2">About Us</Link></li>
                            <li><Link href="/services" className="hover:text-brand-accent transition-colors flex items-center gap-2">Our Services</Link></li>
                            <li><Link href="/communities" className="hover:text-brand-accent transition-colors flex items-center gap-2">Communities</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Services</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="hover:text-brand-accent transition-colors cursor-pointer">Financial Management</li>
                            <li className="hover:text-brand-accent transition-colors cursor-pointer">Property Maintenance</li>
                            <li className="hover:text-brand-accent transition-colors cursor-pointer">Administrative Support</li>
                            <li className="hover:text-brand-accent transition-colors cursor-pointer">Consulting</li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Contact</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-brand-DEFAULT mt-0.5" />
                                <span>PO Box 52395<br/>Durham, NC 27717</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-brand-DEFAULT" />
                                <a href="tel:9195649134" className="hover:text-white">(919) 564-9134</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-brand-DEFAULT" />
                                <a href="mailto:info@communityfocusnc.com" className="hover:text-white">info@communityfocusnc.com</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10 bg-slate-950/50">
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