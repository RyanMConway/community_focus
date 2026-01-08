"use client";

import { useState } from 'react';
import { Mail, Phone, MapPin, Loader2, CheckCircle } from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        userType: 'Homeowner',
        message: ''
    });

    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to send');

            setStatus('success');
            setFormData({ firstName: '', lastName: '', email: '', userType: 'Homeowner', message: '' });
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header - Fixed spacing */}
            <div className="bg-hero-gradient text-white pt-40 pb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Contact Us</h1>
                    <p className="text-blue-100 text-lg md:text-xl font-light">Have a question? We are here to help.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-card overflow-hidden">

                    {/* Left Column (Static Info) */}
                    <div className="bg-brand-dark text-white p-10 md:p-14 flex flex-col justify-center relative overflow-hidden">
                        {/* Subtle pattern */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-dark to-brand-DEFAULT opacity-50"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-serif font-bold mb-8">Get in Touch</h2>
                            <div className="space-y-8">
                                <div className="flex items-start gap-5">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-brand-accent" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Visit Us</h3>
                                        <p className="text-blue-100 leading-relaxed">PO Box 52395<br />Durham, NC 27717</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-5">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5 text-brand-accent" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Call Us</h3>
                                        <p className="text-blue-100 hover:text-white transition-colors">
                                            <a href="tel:9195649134">(919) 564-9134</a>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-5">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-brand-accent" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Email Us</h3>
                                        <p className="text-blue-100 hover:text-white transition-colors">
                                            <a href="mailto:info@communityfocusnc.com">info@communityfocusnc.com</a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Form) */}
                    <div className="p-10 md:p-14">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Send a Message</h2>

                        {status === 'success' ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
                                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                                <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
                                <p className="text-green-700">Thank you for reaching out. We will get back to you shortly.</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-6 text-green-600 font-semibold hover:underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                                        <input
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            type="text"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-DEFAULT focus:border-transparent outline-none transition-all"
                                            placeholder="Jane"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                                        <input
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            type="text"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-DEFAULT focus:border-transparent outline-none transition-all"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                                    <input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        type="email"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-DEFAULT focus:border-transparent outline-none transition-all"
                                        placeholder="jane@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">I am a...</label>
                                    <select
                                        name="userType"
                                        value={formData.userType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-DEFAULT focus:border-transparent outline-none transition-all"
                                    >
                                        <option>Homeowner</option>
                                        <option>Board Member (Requesting Proposal)</option>
                                        <option>Vendor</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-DEFAULT focus:border-transparent outline-none transition-all resize-none"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'submitting'}
                                    className="w-full bg-brand-DEFAULT text-white font-bold py-4 rounded-lg hover:bg-blue-600 transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {status === 'submitting' && <Loader2 className="w-5 h-5 animate-spin" />}
                                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                                </button>

                                {status === 'error' && (
                                    <p className="text-red-500 text-center text-sm">Something went wrong. Please try again.</p>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}