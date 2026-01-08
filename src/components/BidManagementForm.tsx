"use client";

import { useState } from 'react';
import { Send, CheckCircle, Building2 } from 'lucide-react';

export default function BidManagementForm() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        // Simulate API call - Replace with real fetch to /api/contact later
        await new Promise(resolve => setTimeout(resolve, 1500));

        setStatus('success');
    };

    if (status === 'success') {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-in fade-in zoom-in">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">Bid Request Received!</h3>
                <p className="text-green-700">Thank you for considering Community Focus. Our team will review your property details and reach out within 24 hours.</p>
                <button onClick={() => setStatus('idle')} className="mt-6 text-green-800 font-bold hover:underline">
                    Send another request
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-brand text-white p-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Building2 className="w-5 h-5" /> Request a Management Bid
                </h3>
                <p className="text-brand-accent text-sm opacity-90 mt-1">
                    Tell us about your community, and we will tailor a proposal for you.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Name *</label>
                        <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all" placeholder="John Smith" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address *</label>
                        <input required type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Community Name *</label>
                        <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all" placeholder="e.g. Oak Ridge HOA" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Number of Units/Lots *</label>
                        <input required type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all" placeholder="e.g. 150" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Challenges / Needs</label>
                    <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all h-32" placeholder="Tell us what you are looking for in a management company..." />
                </div>

                <button
                    disabled={status === 'submitting'}
                    className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {status === 'submitting' ? 'Sending...' : 'Submit Bid Request'}
                    {!status.includes('submitting') && <Send className="w-4 h-4" />}
                </button>
            </form>
        </div>
    );
}