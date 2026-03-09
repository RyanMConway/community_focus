"use client";

import { Wrench, DollarSign, BookOpen, Users, ExternalLink, Scale } from 'lucide-react';
import Reveal, { RevealItem } from '@/components/Reveal';
import PageHeader from '@/components/PageHeader';

export default function ResourcesPage() {

    const openChatBot = () => {
        const chatButton = document.getElementById('chat-trigger');
        if (chatButton) chatButton.click();
    };

    const PORTAL_URL = "https://cfnc.cincwebaxis.com";
    const WORKORDER_URL = "https://cfnc.cincwebaxis.com/workorders";

    const books = [
        {
            title: "Your Home is Your Castle",
            author: "Richard S. Blumenfeld",
            desc: "A practical guide to understanding HOA covenants and your rights as a homeowner."
        },
        {
            title: "The Homeowners Association Manual",
            author: "Peter M. Dunbar",
            desc: "A comprehensive reference used by board members and managers nationwide."
        },
        {
            title: "Working With Your HOA",
            author: "Marlene M. Coleman",
            desc: "A guide to effective community living, dispute resolution, and volunteering."
        }
    ];

    const quickActions = [
        {
            href: PORTAL_URL,
            external: true,
            icon: DollarSign,
            iconBg: 'bg-green-50',
            iconColor: 'text-green-600',
            hoverBg: 'group-hover:bg-green-100',
            label: 'Pay Assessments',
            desc: 'Login to the CINC Web Portal to view your balance and pay dues securely online.',
            cta: 'Go to Portal',
            ctaIcon: ExternalLink,
            badge: null,
        },
        {
            href: WORKORDER_URL,
            external: true,
            icon: Wrench,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            hoverBg: 'group-hover:bg-blue-100',
            label: 'Maintenance Request',
            desc: 'Report an issue in your common area or submit a work order for HOA repairs.',
            cta: 'Submit Request',
            ctaIcon: ExternalLink,
            badge: null,
        },
        {
            href: null,
            external: false,
            icon: Scale,
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600',
            hoverBg: 'group-hover:bg-purple-100',
            label: 'NC Statutes & Rules',
            desc: 'Our AI Assistant can help you instantly navigate NC General Statutes and community rules.',
            cta: 'Ask the AI Assistant',
            ctaIcon: Users,
            badge: 'AI',
        },
    ];

    const vendorCategories = [
        'Plumbing', 'Electrical', 'Landscaping', 'Roofing',
        'Pest Control', 'Painting', 'Carpet Cleaning', 'General Contracting'
    ];

    return (
        <main className="min-h-screen pb-20 bg-slate-50">
            <PageHeader
                eyebrow="Homeowner Tools"
                title="Owner Resources"
                subtitle="Everything you need to manage your home and community life, all in one place."
            />

            <div className="max-w-7xl mx-auto px-6 pt-6 relative z-20">

                {/* Quick Action Cards */}
                <Reveal width="100%" stagger>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                        {quickActions.map((action, idx) => {
                            const CardIcon = action.icon;
                            const CtaIcon = action.ctaIcon;
                            const inner = (
                                <div className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-card-hover hover:border-brand/20 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-brand-accent to-brand-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    {action.badge && (
                                        <div className="absolute top-0 right-0 bg-brand text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                            {action.badge}
                                        </div>
                                    )}
                                    <div className={`w-14 h-14 ${action.iconBg} rounded-xl flex items-center justify-center mb-6 ${action.hoverBg} ${action.iconColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                        <CardIcon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">{action.label}</h3>
                                    <p className="text-slate-500 mb-6 flex-1">{action.desc}</p>
                                    <span className="text-brand font-bold text-sm flex items-center gap-2 mt-auto">
                                        {action.cta} <CtaIcon className="w-4 h-4" />
                                    </span>
                                </div>
                            );

                            return (
                                <RevealItem key={idx}>
                                    {action.href ? (
                                        <a href={action.href} target={action.external ? "_blank" : undefined} rel={action.external ? "noreferrer" : undefined} className="block h-full">
                                            {inner}
                                        </a>
                                    ) : (
                                        <button onClick={openChatBot} className="block w-full text-left h-full">
                                            {inner}
                                        </button>
                                    )}
                                </RevealItem>
                            );
                        })}
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-4">

                    {/* Vendor Categories */}
                    <Reveal>
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-brand-gold font-bold tracking-wider uppercase text-xs">Recommended Partners</span>
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-slate-800 mb-6 flex items-center gap-3">
                                <Users className="w-6 h-6 text-brand" /> Trusted Vendor Categories
                            </h2>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                <p className="text-slate-600 mb-6">
                                    We have curated a list of local vendors with positive track records. Contact us for specific recommendations in these categories:
                                </p>
                                <ul className="grid grid-cols-2 gap-3">
                                    {vendorCategories.map((item) => (
                                        <li key={item} className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-xl hover:bg-blue-50 hover:text-brand transition-colors">
                                            <div className="w-2 h-2 bg-brand rounded-full flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <a href="/contact" className="text-brand font-bold hover:underline decoration-2 underline-offset-4">
                                        Contact us for a referral &rarr;
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    {/* Recommended Reading */}
                    <Reveal delay={0.1}>
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-brand-gold font-bold tracking-wider uppercase text-xs">Knowledge Base</span>
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-slate-800 mb-6 flex items-center gap-3">
                                <BookOpen className="w-6 h-6 text-brand" /> Recommended Reading
                            </h2>
                            <div className="space-y-4">
                                {books.map((book, i) => (
                                    <div key={i} className="group bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-start hover:shadow-md hover:border-brand/20 transition-all duration-300">
                                        <div className="w-12 h-16 bg-gradient-to-b from-brand to-brand-dark rounded-md flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <BookOpen className="w-5 h-5 text-white/70" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 group-hover:text-brand transition-colors">{book.title}</h4>
                                            <p className="text-xs text-brand-gold uppercase font-bold tracking-wider mb-1">{book.author}</p>
                                            <p className="text-sm text-slate-500">{book.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </main>
    );
}
