"use client";

import { useState } from 'react';
import { Shield, Hammer, Users, Laptop, ChevronDown, CheckCircle, ArrowRight } from 'lucide-react';

export default function ServicesPage() {
    const [openSection, setOpenSection] = useState<number | null>(0);

    const services = [
        {
            title: "Strategic Administrative Support",
            icon: Users,
            description: "We serve as the operational backbone of your association, turning the Board’s vision into action with precision and care.",
            details: [
                "Proactive Management: We manage the day-to-day operations that keep your community running smoothly and maintained to the highest standards.",
                "Board Partnership: From meeting coordination and member communications to on-call homeowner support, we work as a true extension of your Board.",
                "Centralized Records Management: We maintain secure, organized, and transparent records—including financials, tax documents, contracts, and historical data—for easy access and accountability."
            ]
        },
        {
            title: "Financial Integrity & Transparency",
            icon: Shield,
            description: "Our Open-Book Policy ensures clear, straightforward financial oversight so Boards and homeowners always understand the association’s financial health.",
            details: [
                "Comprehensive Accounting: We handle assessments, billing, payment processing, and delinquency management efficiently and accurately.",
                "Budgeting & Financial Planning: We assist with annual budget development and collaborate with trusted local accounting professionals to maximize community resources.",
                "Payables & Compliance: From bank account management and invoice payments to tax filings, we manage all financial obligations on the Board’s behalf."
            ]
        },
        {
            title: "Facility & Project Management",
            icon: Hammer,
            description: "With over two decades of experience, we protect and enhance your community’s physical assets.",
            details: [
                "Amenity Oversight: We provide expert management of pools, tennis courts, clubhouses, and other shared facilities.",
                "Capital Projects: We oversee renovations, repairs, and construction projects—keeping the Board informed at every step.",
                "Long-Term Maintenance Planning: We help develop proactive maintenance schedules that preserve property value and support long-term investment goals."
            ]
        },
        {
            title: "Digital & Communication Services",
            icon: Laptop,
            description: "We use modern technology to keep communities informed, connected, and responsive.",
            details: [
                "Custom Association Portals: Each community receives a dedicated online platform for documents, updates, and announcements.",
                "Convenient Online Payments: Homeowners can securely pay dues via credit card or e-check through our online system.",
                "Responsive Communication: Whether through phone, email, or online systems, we respond promptly and professionally to homeowners, Boards, and vendors."
            ]
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            {/* Header Fix: Added pt-32 for glass navbar */}
            <div className="bg-brand-dark text-white pt-32 pb-20 px-6 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight">
                        Local Expertise. Proven Integrity. <br />
                        <span className="text-brand-accent">Over 20 Years of Excellence.</span>
                    </h1>
                    <p className="text-blue-100 text-lg md:text-xl max-w-3xl mx-auto font-light leading-relaxed">
                        Community Focus is a full-service property management firm specializing in homeowner and commercial associations throughout the Triangle area. Our strictly local approach allows us to deliver exceptional service, faster vendor response times, and a more cost-effective management experience—tailored to the unique needs of each community we serve.
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
                                        <div className={`p-4 rounded-xl transition-all duration-300 flex-shrink-0 ${isOpen ? 'bg-brand text-white rotate-3 scale-110' : 'bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-brand'}`}>
                                            <service.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className={`text-xl font-bold mb-1 transition-colors ${isOpen ? 'text-brand-dark' : 'text-slate-700'}`}>
                                                {service.title}
                                            </h2>
                                            <p className="text-slate-500 text-sm md:text-base hidden sm:block">{service.description}</p>
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-full transition-all ${isOpen ? 'bg-slate-100 rotate-180 text-brand' : 'text-slate-300'}`}>
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </button>

                                {/* Mobile description (visible when open) */}
                                <div className={`px-8 sm:hidden transition-all duration-300 ${isOpen ? 'block mb-4' : 'hidden'}`}>
                                    <p className="text-slate-500 text-sm">{service.description}</p>
                                </div>

                                <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="px-6 md:px-8 pb-8 md:pl-24">
                                        <div className="h-px w-full bg-slate-100 mb-6"></div>
                                        <ul className="grid grid-cols-1 gap-y-4">
                                            {service.details.map((detail, idx) => {
                                                // Split title from description for bolding
                                                const [title, ...desc] = detail.split(':');
                                                const description = desc.join(':');

                                                return (
                                                    <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm md:text-base">
                                                        <CheckCircle className="w-5 h-5 text-brand-accent flex-shrink-0 mt-0.5" />
                                                        <span>
                                                            {description ? (
                                                                <>
                                                                    <strong className="text-slate-800 font-bold block md:inline md:mr-1">{title}:</strong>
                                                                    {description}
                                                                </>
                                                            ) : (
                                                                title
                                                            )}
                                                        </span>
                                                    </li>
                                                );
                                            })}
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