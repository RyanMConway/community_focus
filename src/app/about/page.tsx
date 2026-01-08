"use client";

import Reveal from "@/components/Reveal";
import { Mail, Phone } from 'lucide-react';
import Image from 'next/image';

// --- DATA: UPDATE THIS SECTION WITH REAL INFO ---
const teamMembers = [
    {
        name: "Amy Ghiloni",
        role: "Senior Community Manager",
        email: "amy@communityfocusnc.com",
        phone: "(919) 564-9134",
        image: "/vercel.svg", // <--- REPLACE WITH: "/team/amy.jpg" (Upload to public/team/)
        bio: "Amy has over 15 years of experience in community management. She specializes in large-scale HOA operations and conflict resolution."
    },
    {
        name: "John Doe",
        role: "Financial Coordinator",
        email: "finance@communityfocusnc.com",
        image: "/vercel.svg", // <--- REPLACE
        bio: "John ensures all community accounts are balanced and transparent. He works closely with treasurers to maintain financial health."
    },
    {
        name: "Sarah Smith",
        role: "Maintenance Supervisor",
        email: "maintenance@communityfocusnc.com",
        image: "/vercel.svg", // <--- REPLACE
        bio: "Sarah oversees all vendor contracts and capital improvement projects, ensuring our communities stay beautiful and safe."
    }
];

export default function AboutPage() {
    return (
        <main>
            {/* Hero Section */}
            <div className="bg-brand-dark text-white pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Meet Our Team</h1>
                    <p className="text-xl text-brand-accent max-w-3xl mx-auto leading-relaxed">
                        We are a group of dedicated professionals committed to bringing clarity, community, and focus to your neighborhood.
                    </p>
                </div>
            </div>

            {/* Team Grid */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {teamMembers.map((member, idx) => (
                        <Reveal key={idx} delay={idx * 0.1}>
                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all group h-full flex flex-col">
                                {/* Image Area */}
                                <div className="h-64 bg-slate-100 relative overflow-hidden">
                                    {/* Placeholder for Next.js Image - replace src above */}
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        {/* Use standard img for now to avoid Next.js Image configuration errors if files missing */}
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-bold text-slate-800">{member.name}</h3>
                                    <p className="text-brand font-bold uppercase text-xs tracking-wider mb-4">{member.role}</p>

                                    <p className="text-slate-600 mb-6 flex-1 text-sm leading-relaxed">
                                        {member.bio}
                                    </p>

                                    <div className="pt-6 border-t border-slate-100 space-y-2">
                                        {member.email && (
                                            <a href={`mailto:${member.email}`} className="flex items-center gap-3 text-slate-500 hover:text-brand text-sm transition-colors">
                                                <Mail className="w-4 h-4" /> {member.email}
                                            </a>
                                        )}
                                        {member.phone && (
                                            <div className="flex items-center gap-3 text-slate-500 text-sm">
                                                <Phone className="w-4 h-4" /> {member.phone}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>

            {/* Values Section */}
            <div className="bg-slate-50 py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-serif font-bold text-slate-800 mb-12">Our Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Transparency", text: "Open books and clear communication are the foundation of trust." },
                            { title: "Proactivity", text: "We solve problems before they become emergencies." },
                            { title: "Community", text: "We don't just manage properties; we build neighborhoods." }
                        ].map((val, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-brand-dark mb-2">{val.title}</h3>
                                <p className="text-slate-600 text-sm">{val.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}