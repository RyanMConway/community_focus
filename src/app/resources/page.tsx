"use client";

import { Wrench, DollarSign, BookOpen, Users, ExternalLink, Scale } from 'lucide-react';
import Reveal from '@/components/Reveal';

export default function ResourcesPage() {

    // Helper to open the chat bot
    const openChatBot = () => {
        const chatButton = document.getElementById('chat-trigger');
        if (chatButton) chatButton.click();
    };

    // Real Book Data (Links removed)
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

    return (
        <main className="min-h-screen pt-24 pb-20 bg-slate-50">
            {/* Header */}
            <div className="bg-brand-dark text-white py-16 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl font-serif font-bold mb-4">Owner Resources</h1>
                    <p className="text-brand-accent text-lg max-w-2xl mx-auto">
                        Everything you need to manage your home and community life, all in one place.
                    </p>
                </div>
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Card 1: Payments */}
                    <Reveal delay={0.1}>
                        <a href="https://cfnc.cincwebaxis.com/" target="_blank" rel="noreferrer" className="block group">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1 h-full">
                                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-100 transition-colors">
                                    <DollarSign className="w-7 h-7 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Pay Assessments</h3>
                                <p className="text-slate-500 mb-4">Login to the CINC Web Portal to view your balance and pay dues securely online.</p>
                                <span className="text-brand font-bold text-sm flex items-center gap-2">
                                    Go to Portal <ExternalLink className="w-4 h-4" />
                                </span>
                            </div>
                        </a>
                    </Reveal>

                    {/* Card 2: Maintenance */}
                    <Reveal delay={0.2}>
                        <a href="https://cfnc.cincwebaxis.com/workorders" target="_blank" rel="noreferrer" className="block group">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1 h-full">
                                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                                    <Wrench className="w-7 h-7 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Maintenance Request</h3>
                                <p className="text-slate-500 mb-4">Report an issue in your common area or submit a work order for HOA repairs.</p>
                                <span className="text-brand font-bold text-sm flex items-center gap-2">
                                    Submit Request <ExternalLink className="w-4 h-4" />
                                </span>
                            </div>
                        </a>
                    </Reveal>

                    {/* Card 3: Legal / Chat Bot Link */}
                    <Reveal delay={0.3}>
                        <button onClick={openChatBot} className="block group w-full text-left h-full">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1 h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-brand text-white text-xs font-bold px-3 py-1 rounded-bl-lg">NEW</div>
                                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-100 transition-colors">
                                    <Scale className="w-7 h-7 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">NC Statutes & Rules</h3>
                                <p className="text-slate-500 mb-4">Questions about community rules? Our AI Assistant can help you navigate the NC General Statutes (47F/47C).</p>
                                <span className="text-brand font-bold text-sm flex items-center gap-2">
                                    Ask the AI Assistant <Users className="w-4 h-4" />
                                </span>
                            </div>
                        </button>
                    </Reveal>
                </div>

                {/* Vendor & Reading List Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-20">

                    {/* Trusted Vendors */}
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-slate-800 mb-6 flex items-center gap-3">
                            <Users className="w-6 h-6 text-brand" /> Trusted Vendor Categories
                        </h2>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <p className="text-slate-600 mb-6">
                                We have curated a list of local vendors with positive track records. Contact us for specific recommendations in these categories:
                            </p>
                            <ul className="grid grid-cols-2 gap-4">
                                {['Plumbing', 'Electrical', 'Landscaping', 'Roofing', 'Pest Control', 'Painting', 'Carpet Cleaning', 'General Contracting'].map((item) => (
                                    <li key={item} className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-lg">
                                        <div className="w-2 h-2 bg-brand rounded-full"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <a href="/contact" className="text-brand font-bold hover:underline">Contact us for a referral &rarr;</a>
                            </div>
                        </div>
                    </div>

                    {/* Recommended Reading (Static List) */}
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-slate-800 mb-6 flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-brand" /> Recommended Reading
                        </h2>
                        <div className="space-y-4">
                            {books.map((book, i) => (
                                <div
                                    key={i}
                                    className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-start"
                                >
                                    {/* Book Icon */}
                                    <div className="w-12 h-16 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0 text-slate-300">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800">{book.title}</h4>
                                        <p className="text-xs text-brand-accent uppercase font-bold tracking-wider mb-1">{book.author}</p>
                                        <p className="text-sm text-slate-500">{book.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}