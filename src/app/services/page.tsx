"use client";

import { useState } from 'react';
import { Shield, Hammer, Users, ChevronDown, CheckCircle, ArrowRight } from 'lucide-react';

export default function ServicesPage() {
    const [openSection, setOpenSection] = useState<number | null>(0); // Default first one open

    const services = [
        {
            title: "Financial Management",
            icon: Shield,
            description: "Complete financial oversight and transparency for your association.",
            details: ["Assessment collection & delinquency management", "Vendor invoice processing & payment", "Detailed monthly financial reporting", "Annual budget preparation", "Audit & tax return coordination"]
        },
        {
            title: "Property Maintenance",
            icon: Hammer,
            description: "Proactive care to preserve and enhance your community's value.",
            details: ["Regular site inspections with photo reports", "Vendor bidding & project supervision", "24/7 emergency maintenance response", "Common area upkeep oversight", "Preventative maintenance planning"]
        },
        {
            title: "Administrative Support",
            icon: Users,
            description: "Day-to-day operations handled with professionalism and care.",
            details: ["Board meeting attendance & minutes", "Annual meeting coordination", "Homeowner communication portal", "Architectural review processing", "Violation enforcement & compliance"]
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            {/* Header Fix: Added pt-32 for glass navbar */}
            <div className="bg-brand-dark text-white pt-32 pb-20 px-6 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Our Services</h1>
                    <p className="text-brand-accent text-lg max-w-xl mx-auto font-light">
                        Comprehensive management solutions tailored to the unique needs of your community.
                    </p>
                </div>
                {/* Background blobbies */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10"></div>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20">
                <div className="space-y-4">
                    {services.map((service, index) => {
                        const isOpen = openSection === index;
                        return (
                            <div
                                key={index}
                                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden
                                    ${isOpen ? 'shadow-xl border-brand/20 ring-1 ring-brand/10' : 'shadow-sm border-slate-100 hover:border-slate-300'}
                                `}
                            >
                                <button
                                    onClick={() => setOpenSection(isOpen ? null : index)}
                                    className="w-full flex items-center justify-between p-6 md:p-8 text-left group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`p-4 rounded-xl transition-all duration-300 ${isOpen ? 'bg-brand text-white rotate-3 scale-110' : 'bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-brand'}`}>
                                            <service.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className={`text-xl font-bold mb-1 transition-colors ${isOpen ? 'text-brand-dark' : 'text-slate-700'}`}>
                                                {service.title}
                                            </h2>
                                            <p className="text-slate-500 text-sm md:text-base">{service.description}</p>
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-full transition-all ${isOpen ? 'bg-slate-100 rotate-180 text-brand' : 'text-slate-300'}`}>
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </button>

                                <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="px-8 pb-8 pl-24">
                                        <div className="h-px w-full bg-slate-100 mb-6"></div>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                                            {service.details.map((detail, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm">
                                                    <CheckCircle className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
                                                    <span>{detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-8 pt-4">
                                            <a href="/contact" className="text-brand font-bold text-sm flex items-center hover:gap-2 transition-all">
                                                Request a Proposal <ArrowRight className="w-4 h-4 ml-1" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}