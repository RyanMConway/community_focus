"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, MessageSquare, Building } from 'lucide-react';
import BidManagementForm from "@/components/BidManagementForm";

export default function ContactPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'bid'>('general');

    return (
        <main className="min-h-screen bg-slate-50 pt-24 pb-20">
            {/* Header */}
            <div className="bg-brand-dark text-white py-16 px-6 text-center">
                <h1 className="text-4xl font-serif font-bold mb-4">Contact Us</h1>
                <p className="text-brand-accent text-lg max-w-xl mx-auto">
                    We are here to help. Reach out for support or request a proposal for your community.
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Sidebar Info */}
                    <div className="bg-brand text-white p-8 rounded-2xl shadow-xl h-fit">
                        <h2 className="text-2xl font-bold mb-8">Get in touch</h2>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-white/20 p-3 rounded-lg"><Phone className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-xs text-brand-accent uppercase font-bold">Call Us</p>
                                    <p className="font-medium">(919) 564-9134</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-white/20 p-3 rounded-lg"><Mail className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-xs text-brand-accent uppercase font-bold">Email Us</p>
                                    <p className="font-medium">info@communityfocusnc.com</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-white/20 p-3 rounded-lg"><MapPin className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-xs text-brand-accent uppercase font-bold">Visit Us</p>
                                    <p className="font-medium">Durham, NC</p>
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
                                        <input className="w-full p-3 bg-slate-50 border rounded-lg" placeholder="First Name" />
                                        <input className="w-full p-3 bg-slate-50 border rounded-lg" placeholder="Last Name" />
                                    </div>
                                    <input className="w-full p-3 bg-slate-50 border rounded-lg" placeholder="Email Address" />
                                    <textarea className="w-full p-3 bg-slate-50 border rounded-lg h-32" placeholder="How can we help?" />
                                    <button className="bg-brand text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-dark transition-colors">
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