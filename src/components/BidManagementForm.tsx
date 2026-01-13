"use client";

import { useState } from 'react';
import { Send, CheckCircle, Building2 } from 'lucide-react';

// Reusable "Floating Label" Input Component
const FloatingInput = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div className="relative">
        <input
            {...props}
            placeholder=" " // Important for the CSS trick
            className="block px-4 pb-3 pt-6 w-full text-slate-900 bg-slate-50 rounded-xl border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand peer transition-all"
        />
        <label className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-brand">
            {label}
        </label>
    </div>
);

export default function BidManagementForm() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStatus('success');
    };

    if (status === 'success') {
        return (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">Request Received!</h3>
                <p className="text-green-700 max-w-sm mx-auto">We have received your details. A member of our team will review your property info and contact you within 24 hours.</p>
                <button onClick={() => setStatus('idle')} className="mt-8 text-green-700 font-bold hover:text-green-900 text-sm bg-white px-6 py-2 rounded-full border border-green-200 shadow-sm">
                    Submit another request
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
            <div className="bg-brand text-white p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="text-xl font-bold flex items-center gap-2 relative z-10">
                    <Building2 className="w-5 h-5" /> Request a Proposal
                </h3>
                <p className="text-brand-accent text-sm opacity-90 mt-2 relative z-10 max-w-sm">
                    Tell us about your community's needs, and we will build a custom management plan for you.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FloatingInput required label="Your Name" />
                    <FloatingInput required type="email" label="Email Address" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FloatingInput required label="Community Name" />
                    <FloatingInput required type="number" label="Number of Units" />
                </div>

                <div className="relative">
                    <textarea
                        className="block px-4 pb-3 pt-6 w-full text-slate-900 bg-slate-50 rounded-xl border border-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand peer transition-all h-32"
                        placeholder=" "
                    />
                    <label className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-brand">
                        Current Challenges / Needs
                    </label>
                </div>

                <button
                    disabled={status === 'submitting'}
                    className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                    {status === 'submitting' ? 'Sending Request...' : 'Submit Request'}
                    {!status.includes('submitting') && <Send className="w-4 h-4" />}
                </button>
            </form>
        </div>
    );
}