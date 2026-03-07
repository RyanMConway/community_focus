"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CheckCircle2, ChevronRight, ChevronLeft, Send, Loader } from 'lucide-react';
import Link from 'next/link';

const STEPS = ['Your Community', 'Your Needs', 'Contact Info'];

const ASSOCIATION_TYPES = ['HOA', 'Condominium', 'Townhome', 'Mixed-Use'];
const SITUATIONS = ['Self-managed', 'Currently with another company', 'New development'];
const SERVICES = ['Financial Management', 'Property Maintenance', 'Administrative Support', 'Vendor Management', 'Full Service'];
const TIMELINES = ['As soon as possible', 'Within 3 months', 'Just exploring options'];
const ROLES = ['Board President', 'Board Treasurer', 'Board Member', 'Property Owner', 'Other'];
const TIMES = ['Morning (8am–12pm)', 'Afternoon (12pm–5pm)', 'Evening (5pm–8pm)'];

type FormState = {
    communityName: string; associationType: string; unitCount: string;
    city: string; currentSituation: string;
    servicesNeeded: string[]; biggestChallenge: string; timeline: string;
    contactName: string; contactRole: string; contactEmail: string;
    contactPhone: string; bestTime: string;
};

const INITIAL: FormState = {
    communityName: '', associationType: '', unitCount: '', city: '', currentSituation: '',
    servicesNeeded: [], biggestChallenge: '', timeline: '',
    contactName: '', contactRole: '', contactEmail: '', contactPhone: '', bestTime: '',
};

const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

function OptionButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all duration-200
                ${selected
                    ? 'border-brand bg-brand/5 text-brand shadow-sm shadow-brand/10'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
        >
            <span className="flex items-center gap-3">
                <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                    ${selected ? 'border-brand bg-brand' : 'border-slate-300'}`}>
                    {selected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                </span>
                {label}
            </span>
        </button>
    );
}

function CheckboxButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all duration-200
                ${selected
                    ? 'border-brand bg-brand/5 text-brand shadow-sm shadow-brand/10'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
        >
            <span className="flex items-center gap-3">
                <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all
                    ${selected ? 'border-brand bg-brand' : 'border-slate-300'}`}>
                    {selected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </span>
                {label}
            </span>
        </button>
    );
}

export default function GetProposalPage() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<FormState>(INITIAL);
    const [direction, setDirection] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const set = (key: keyof FormState, value: string) =>
        setForm(prev => ({ ...prev, [key]: value }));

    const toggleService = (s: string) =>
        setForm(prev => ({
            ...prev,
            servicesNeeded: prev.servicesNeeded.includes(s)
                ? prev.servicesNeeded.filter(x => x !== s)
                : [...prev.servicesNeeded, s],
        }));

    const canProceed = () => {
        if (step === 0) return form.communityName.trim() && form.associationType && form.unitCount && form.city.trim() && form.currentSituation;
        if (step === 1) return form.servicesNeeded.length > 0 && form.timeline;
        if (step === 2) return form.contactName.trim() && form.contactRole && form.contactEmail.trim() && form.contactPhone.trim() && form.bestTime;
        return false;
    };

    const goNext = () => { setDirection(1); setStep(s => s + 1); };
    const goBack = () => { setDirection(-1); setStep(s => s - 1); };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/bid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error('Submission failed');
            setSubmitted(true);
        } catch {
            setError('Something went wrong. Please try again or call us at (919) 564-9134.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Hero Header */}
            <div className="bg-gradient-mesh pt-36 pb-32 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />
                <div className="relative z-10 text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-blue-100 mb-6 backdrop-blur-sm">
                        <Building2 className="w-4 h-4 text-brand-gold" />
                        No obligation · Response within 2 business days
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                        Get a Proposal
                    </h1>
                    <p className="text-blue-100/80 text-lg">
                        Tell us about your community and we'll prepare a custom management proposal tailored to your needs.
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="max-w-2xl mx-auto px-4 -mt-16 pb-24 relative z-10">
                {submitted ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-xl border border-slate-100 p-12 text-center"
                    >
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-slate-800 mb-3">Request Received!</h2>
                        <p className="text-slate-500 mb-2">
                            Thank you, <span className="font-semibold text-slate-700">{form.contactName}</span>. We've received your proposal request for <span className="font-semibold text-slate-700">{form.communityName}</span>.
                        </p>
                        <p className="text-slate-500 mb-8">
                            Our team will review your submission and reach out within <strong>2 business days</strong>. In the meantime, feel free to call us at{' '}
                            <a href="tel:9195649134" className="text-brand font-semibold hover:underline">(919) 564-9134</a>.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-brand text-white px-8 py-3 rounded-full font-bold hover:bg-brand-dark transition-colors shadow-md"
                        >
                            Back to Home
                        </Link>
                    </motion.div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                        {/* Progress Bar */}
                        <div className="h-1 bg-slate-100">
                            <motion.div
                                className="h-full bg-gradient-to-r from-brand to-brand-accent"
                                animate={{ width: `${((step + 1) / 3) * 100}%` }}
                                transition={{ duration: 0.4, ease: 'easeInOut' }}
                            />
                        </div>

                        {/* Step Indicator */}
                        <div className="px-8 pt-8 pb-6">
                            <div className="flex items-center justify-between relative">
                                <div className="absolute top-4 left-0 right-0 h-px bg-slate-200 z-0" />
                                {STEPS.map((label, i) => (
                                    <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                                        <motion.div
                                            animate={{
                                                backgroundColor: i < step ? '#2563eb' : i === step ? '#2563eb' : '#e2e8f0',
                                                scale: i === step ? 1.15 : 1,
                                            }}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                                        >
                                            {i < step
                                                ? <CheckCircle2 className="w-4 h-4 text-white" />
                                                : <span className={i === step ? 'text-white' : 'text-slate-400'}>{i + 1}</span>
                                            }
                                        </motion.div>
                                        <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-brand' : i < step ? 'text-slate-500' : 'text-slate-300'}`}>
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Step Content */}
                        <div className="px-8 pb-8 overflow-hidden">
                            <AnimatePresence mode="wait" custom={direction}>
                                {step === 0 && (
                                    <motion.div key="step0" custom={direction} variants={variants}
                                        initial="enter" animate="center" exit="exit"
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800 mb-1">Your Community</h2>
                                            <p className="text-sm text-slate-500">Tell us about the association you manage.</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Community Name *</label>
                                                <input
                                                    type="text" placeholder="e.g. Oakwood Estates HOA"
                                                    value={form.communityName} onChange={e => set('communityName', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-sm transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">City *</label>
                                                <input
                                                    type="text" placeholder="e.g. Durham"
                                                    value={form.city} onChange={e => set('city', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-sm transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Number of Units *</label>
                                                <input
                                                    type="number" placeholder="e.g. 120" min="1"
                                                    value={form.unitCount} onChange={e => set('unitCount', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-sm transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Association Type *</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {ASSOCIATION_TYPES.map(t => (
                                                    <OptionButton key={t} label={t} selected={form.associationType === t} onClick={() => set('associationType', t)} />
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Current Situation *</label>
                                            <div className="space-y-2">
                                                {SITUATIONS.map(s => (
                                                    <OptionButton key={s} label={s} selected={form.currentSituation === s} onClick={() => set('currentSituation', s)} />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 1 && (
                                    <motion.div key="step1" custom={direction} variants={variants}
                                        initial="enter" animate="center" exit="exit"
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800 mb-1">Your Needs</h2>
                                            <p className="text-sm text-slate-500">Help us understand what you're looking for.</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Services Needed * <span className="normal-case font-normal">(select all that apply)</span></label>
                                            <div className="space-y-2">
                                                {SERVICES.map(s => (
                                                    <CheckboxButton key={s} label={s} selected={form.servicesNeeded.includes(s)} onClick={() => toggleService(s)} />
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Biggest Challenge <span className="normal-case font-normal">(optional)</span></label>
                                            <textarea
                                                placeholder="e.g. Delinquent dues collection, vendor coordination, lack of communication..."
                                                value={form.biggestChallenge} onChange={e => set('biggestChallenge', e.target.value)}
                                                rows={3}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-sm transition-all resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Timeline *</label>
                                            <div className="space-y-2">
                                                {TIMELINES.map(t => (
                                                    <OptionButton key={t} label={t} selected={form.timeline === t} onClick={() => set('timeline', t)} />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div key="step2" custom={direction} variants={variants}
                                        initial="enter" animate="center" exit="exit"
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800 mb-1">Contact Information</h2>
                                            <p className="text-sm text-slate-500">Who should we reach out to with the proposal?</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Your Name *</label>
                                                <input
                                                    type="text" placeholder="Full name"
                                                    value={form.contactName} onChange={e => set('contactName', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-sm transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email *</label>
                                                <input
                                                    type="email" placeholder="you@example.com"
                                                    value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-sm transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Phone *</label>
                                                <input
                                                    type="tel" placeholder="(919) 000-0000"
                                                    value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-sm transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Your Role *</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {ROLES.map(r => (
                                                    <OptionButton key={r} label={r} selected={form.contactRole === r} onClick={() => set('contactRole', r)} />
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Best Time to Reach You *</label>
                                            <div className="space-y-2">
                                                {TIMES.map(t => (
                                                    <OptionButton key={t} label={t} selected={form.bestTime === t} onClick={() => set('bestTime', t)} />
                                                ))}
                                            </div>
                                        </div>

                                        {error && (
                                            <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Navigation */}
                        <div className="px-8 pb-8 flex justify-between items-center gap-4">
                            {step > 0 ? (
                                <button onClick={goBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors">
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                            ) : <div />}

                            {step < 2 ? (
                                <button
                                    onClick={goNext}
                                    disabled={!canProceed()}
                                    className="ml-auto flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-brand-dark transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
                                >
                                    Next: {STEPS[step + 1]} <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!canProceed() || submitting}
                                    className="ml-auto flex items-center gap-2 bg-brand text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-brand-dark transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {submitting ? <><Loader className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Submit Request</>}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
