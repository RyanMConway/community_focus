"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Building2, ArrowRight, Check, Loader2, Home, ArrowLeft } from 'lucide-react';

// Reusable Floating Input for consistent design
const FloatingInput = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div className="relative group">
        <input
            {...props}
            placeholder=" "
            className="block px-4 pb-2.5 pt-5 w-full text-sm text-slate-900 bg-white/10 border border-white/20 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 peer transition-all text-white placeholder-transparent backdrop-blur-sm"
        />
        <label className="absolute text-sm text-blue-100/70 duration-300 transform -translate-y-3 scale-75 top-3.5 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-white">
            {label}
        </label>
    </div>
);

export default function HomeQuestionnaire() {
    const router = useRouter();
    const [step, setStep] = useState<'initial' | 'details' | 'contact' | 'success'>('initial');
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        communityName: '',
        units: '',
        amenities: [] as string[],
        firstName: '',
        lastName: '',
        email: ''
    });

    const amenitiesList = ['Pool', 'Clubhouse', 'Gate', 'Gym', 'Walking Trails'];

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleHomeownerClick = () => {
        router.push('/resources');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Format the community details into a readable message for the backend
            const messageBody = `
NEW MANAGEMENT INQUIRY
----------------------
Community: ${formData.communityName}
Units: ${formData.units}
Amenities: ${formData.amenities.join(', ') || 'None selected'}
            `.trim();

            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    userType: 'Board Member',
                    message: messageBody
                })
            });

            if (res.ok) {
                setStep('success');
            } else {
                alert("Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("Error submitting form.");
        } finally {
            setLoading(false);
        }
    };

    // Variants for smooth transitions
    const slideVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="w-full max-w-3xl mx-auto mt-8">
            <AnimatePresence mode="wait">

                {/* STEP 1: INITIAL SELECTION */}
                {step === 'initial' && (
                    <motion.div
                        key="initial"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        {/* Homeowner Option */}
                        <button
                            onClick={handleHomeownerClick}
                            className="group relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl text-left hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10"
                        >
                            <div className="bg-blue-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Home className="w-6 h-6 text-blue-200" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">I am a Homeowner</h3>
                            <p className="text-blue-100/80 text-sm">Access the portal, view documents, or make a payment.</p>
                            <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </button>

                        {/* Board Member Option */}
                        <button
                            onClick={() => setStep('details')}
                            className="group relative overflow-hidden bg-brand-accent/20 backdrop-blur-md border border-brand-accent/30 p-8 rounded-2xl text-left hover:bg-brand-accent/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10"
                        >
                            <div className="bg-brand-accent/20 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Building2 className="w-6 h-6 text-brand-accent" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">I am a Board Member</h3>
                            <p className="text-blue-100/80 text-sm">Looking for modern, transparent community management.</p>
                            <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </button>
                    </motion.div>
                )}

                {/* STEP 2: COMMUNITY DETAILS */}
                {step === 'details' && (
                    <motion.div
                        key="details"
                        variants={slideVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <button onClick={() => setStep('initial')} className="text-blue-200 hover:text-white text-sm flex items-center gap-1">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <span className="text-blue-200/50 text-xs font-bold uppercase tracking-widest">Step 1 of 2</span>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-6 text-left">Tell us about your community</h3>

                        <div className="space-y-4">
                            <FloatingInput
                                label="Community Name"
                                value={formData.communityName}
                                onChange={(e) => setFormData({...formData, communityName: e.target.value})}
                            />
                            <FloatingInput
                                label="Approximate Number of Homes"
                                type="number"
                                value={formData.units}
                                onChange={(e) => setFormData({...formData, units: e.target.value})}
                            />

                            <div className="pt-2">
                                <label className="block text-sm text-blue-100/80 mb-3 text-left">Amenities (Select all that apply)</label>
                                <div className="flex flex-wrap gap-2">
                                    {amenitiesList.map(amenity => (
                                        <button
                                            key={amenity}
                                            onClick={() => toggleAmenity(amenity)}
                                            className={`px-4 py-2 rounded-full text-sm border transition-all ${
                                                formData.amenities.includes(amenity)
                                                    ? 'bg-brand-accent text-brand-dark border-brand-accent font-semibold'
                                                    : 'bg-white/5 text-blue-100 border-white/10 hover:bg-white/10'
                                            }`}
                                        >
                                            {amenity}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setStep('contact')}
                                disabled={!formData.communityName || !formData.units}
                                className="w-full mt-6 bg-white text-brand-dark font-bold py-3.5 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Next Step <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: CONTACT INFO */}
                {step === 'contact' && (
                    <motion.div
                        key="contact"
                        variants={slideVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <button onClick={() => setStep('details')} className="text-blue-200 hover:text-white text-sm flex items-center gap-1">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <span className="text-blue-200/50 text-xs font-bold uppercase tracking-widest">Step 2 of 2</span>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-6 text-left">Where should we send your proposal?</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FloatingInput
                                    label="First Name"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                />
                                <FloatingInput
                                    label="Last Name"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                />
                            </div>
                            <FloatingInput
                                label="Email Address"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 bg-brand-accent hover:bg-white text-brand-dark font-bold py-4 rounded-xl transition-all shadow-lg shadow-black/10 hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Consultation'}
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* STEP 4: SUCCESS */}
                {step === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl text-center max-w-lg mx-auto"
                    >
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">Information Received!</h3>
                        <p className="text-slate-600 leading-relaxed mb-8">
                            Thank you for telling us about {formData.communityName}. We will review your community's needs and reach out to you at {formData.email} shortly.
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="text-brand font-bold hover:underline"
                        >
                            Return Home
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}