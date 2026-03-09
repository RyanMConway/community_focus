"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, MessageSquare, Building } from 'lucide-react';
import BidManagementForm from "@/components/BidManagementForm";
import PageHeader from "@/components/PageHeader";

export default function ContactPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'bid'>('general');

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            <PageHeader
                eyebrow="Get in Touch"
                title="Contact Us"
                subtitle="We are here to help. Reach out for support or request a proposal for your community."
            />

            <div className="max-w-6xl mx-auto px-6 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Sidebar — dark glass card */}
                    <div className="relative bg-gradient-to-br from-brand-dark to-brand text-white p-8 rounded-2xl shadow-xl overflow-hidden h-fit">
                        <div className="absolute inset-0 bg-grid-white opacity-10 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

                        <div className="relative z-10">
                            <span className="text-brand-gold font-bold tracking-wider uppercase text-xs mb-4 block">
                                Reach Out
                            </span>
                            <h2 className="text-2xl font-bold mb-8">Get in touch</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-white/15 p-3 rounded-xl flex-shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-brand-gold uppercase font-bold mb-1">Call Us</p>
                                        <p className="font-medium">(919) 564-9134</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-white/15 p-3 rounded-xl flex-shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-brand-gold uppercase font-bold mb-1">Email Us</p>
                                        <p className="font-medium text-sm">info@communityfocusnc.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-white/15 p-3 rounded-xl flex-shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-brand-gold uppercase font-bold mb-1">Visit Us</p>
                                        <p className="font-medium">Durham, NC</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Form Area */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Tab Switcher */}
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'general' ? 'bg-brand text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <MessageSquare className="w-4 h-4" /> General Inquiry
                            </button>
                            <button
                                onClick={() => setActiveTab('bid')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'bid' ? 'bg-brand text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <Building className="w-4 h-4" /> Bid for Management
                            </button>
                        </div>

                        {/* Content */}
                        {activeTab === 'bid' ? (
                            <BidManagementForm />
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                                <h3 className="text-xl font-bold text-slate-800 mb-6">Send us a message</h3>
                                <form className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                            placeholder="First Name"
                                        />
                                        <input
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                            placeholder="Last Name"
                                        />
                                    </div>
                                    <input
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                        placeholder="Email Address"
                                        type="email"
                                    />
                                    <textarea
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-32 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
                                        placeholder="How can we help?"
                                    />
                                    <button className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors shadow-sm hover:shadow-glow">
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
