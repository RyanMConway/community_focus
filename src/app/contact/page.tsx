"use client";

import { useState } from "react";
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageSquare, Building, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import BidManagementForm from "@/components/BidManagementForm";
import { FormInput, FormTextarea } from '@/components/FormInput';
import PageHeader from "@/components/PageHeader";

export default function ContactPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'bid'>('general');
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [formError, setFormError] = useState('');

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
                        <AnimatePresence mode="wait">
                            {activeTab === 'bid' ? (
                                <motion.div
                                    key="bid"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <BidManagementForm />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="general"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                                        {formStatus === 'success' ? (
                                            <div className="text-center py-8">
                                                <div className="w-16 h-16 bg-emerald-100 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <CheckCircle className="w-8 h-8" aria-hidden="true" />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-800 mb-2">Message Sent!</h3>
                                                <p className="text-slate-500 max-w-sm mx-auto text-sm">Thank you for reaching out. We will get back to you within 1 business day.</p>
                                                <button
                                                    onClick={() => { setFormStatus('idle'); setFormError(''); }}
                                                    className="mt-6 text-brand font-bold hover:text-brand-dark text-sm cursor-pointer"
                                                >
                                                    Send another message
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-xl font-bold text-slate-800 mb-6">Send us a message</h3>
                                                <form
                                                    className="space-y-4"
                                                    onSubmit={async (e) => {
                                                        e.preventDefault();
                                                        setFormStatus('submitting');
                                                        setFormError('');
                                                        const data = new FormData(e.currentTarget);
                                                        try {
                                                            const res = await fetch('/api/contact', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    firstName: data.get('firstName'),
                                                                    lastName: data.get('lastName'),
                                                                    email: data.get('email'),
                                                                    userType: 'general',
                                                                    message: data.get('message'),
                                                                }),
                                                            });
                                                            if (!res.ok) throw new Error('Failed to send');
                                                            setFormStatus('success');
                                                        } catch {
                                                            setFormStatus('error');
                                                            setFormError('Something went wrong. Please try again or call us directly.');
                                                        }
                                                    }}
                                                >
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormInput
                                                            id="contact-first-name"
                                                            label="First Name"
                                                            name="firstName"
                                                            autoComplete="given-name"
                                                            required
                                                            placeholder="Jane"
                                                        />
                                                        <FormInput
                                                            id="contact-last-name"
                                                            label="Last Name"
                                                            name="lastName"
                                                            autoComplete="family-name"
                                                            placeholder="Smith"
                                                        />
                                                    </div>
                                                    <FormInput
                                                        id="contact-email"
                                                        label="Email Address"
                                                        name="email"
                                                        type="email"
                                                        autoComplete="email"
                                                        required
                                                        placeholder="jane@example.com"
                                                    />
                                                    <FormTextarea
                                                        id="contact-message"
                                                        label="Message"
                                                        name="message"
                                                        required
                                                        className="h-32"
                                                        placeholder="How can we help?"
                                                    />
                                                    {formStatus === 'error' && formError && (
                                                        <div className="flex items-center gap-2 text-red-600 text-sm" role="alert">
                                                            <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                                                            <span>{formError}</span>
                                                        </div>
                                                    )}
                                                    <button
                                                        type="submit"
                                                        disabled={formStatus === 'submitting'}
                                                        className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors shadow-sm hover:shadow-glow cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                                    >
                                                        {formStatus === 'submitting' ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                                                Sending...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send className="w-4 h-4" aria-hidden="true" />
                                                                Send Message
                                                            </>
                                                        )}
                                                    </button>
                                                </form>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </main>
    );
}
