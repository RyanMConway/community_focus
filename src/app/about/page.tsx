import Image from 'next/image';
import { Mail, Shield, Users, Heart } from 'lucide-react';
import Reveal from '@/components/Reveal';

// --- TEAM DATA ---
// We keep everyone in one array to display them equally in a grid
const teamMembers = [
    {
        name: "Robin Conway",
        title: "President / Owner", // Verify this title
        image: "/team/robin-conway.jpg",
        bio: "Dedicated to building strong community relationships and ensuring transparent management for all our associations.",
        email: "rconway@communityfocusnc.com"
    },
    {
        name: "Josh Lindgren",
        title: "Senior Association Manager", // Verify this title
        image: "/team/josh-lindgren.jpg",
        bio: "Expert in property maintenance and vendor coordination, ensuring that your community always looks its best.",
        email: "jlindgren@communityfocusnc.com"
    },
    {
        name: "Madison Kichline",
        title: "VP of Operations",
        image: "/team/madison.png", // <--- Make sure file is in public/team/madison.png
        bio: "Madison brings a wealth of operational expertise to the team. Full bio coming soon...",
        email: "mkichline@communityfocusnc.com" // Placeholder email
    }
];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-slate-50 pt-24 pb-20">

            {/* 1. Hero / Mission Section */}
            <div className="bg-brand-dark text-white py-20 px-6 relative overflow-hidden mb-20">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <Reveal>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Community First</h1>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <p className="text-xl text-blue-100 leading-relaxed">
                            We founded Community Focus of NC with a simple belief: HOAs should build communities, not just collect dues.
                            We believe in transparency, responsiveness, and treating every homeowner with respect.
                        </p>
                    </Reveal>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
            </div>

            <div className="container mx-auto px-6">

                {/* 2. Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <Reveal delay={0.1}>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:-translate-y-1 transition-transform">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-brand">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Integrity</h3>
                            <p className="text-slate-600">We operate with complete financial transparency. No hidden fees, no surprises.</p>
                        </div>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:-translate-y-1 transition-transform">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-brand">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Communication</h3>
                            <p className="text-slate-600">We answer the phone. We reply to emails. We are here when you need us.</p>
                        </div>
                    </Reveal>
                    <Reveal delay={0.3}>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:-translate-y-1 transition-transform">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-brand">
                                <Heart className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Care</h3>
                            <p className="text-slate-600">We treat your neighborhood like it's our own, focusing on long-term value.</p>
                        </div>
                    </Reveal>
                </div>

                {/* 3. TEAM SECTION (Renamed from Leadership) */}
                <div className="mb-20">
                    <div className="text-center mb-16">
                        <Reveal>
                            <h2 className="text-3xl font-bold text-slate-800 mb-4">Our Team</h2>
                            <div className="w-16 h-1 bg-brand mx-auto rounded-full"></div>
                            <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
                                The dedicated professionals working every day to support your community.
                            </p>
                        </Reveal>
                    </div>

                    {/* GRID LAYOUT:
                       - md:grid-cols-3 ensures all 3 sit side-by-side on desktop.
                       - No "Leader" section vs "Staff" section. Everyone is equal.
                    */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {teamMembers.map((member, idx) => (
                            <Reveal key={idx} delay={idx * 0.1}>
                                <div className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all h-full flex flex-col">
                                    {/* Image Container */}
                                    <div className="relative h-72 w-full bg-slate-200 overflow-hidden">
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            fill
                                            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-slate-800 mb-1">{member.name}</h3>
                                        <p className="text-brand font-medium text-sm mb-4">{member.title}</p>

                                        <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                                            {member.bio}
                                        </p>

                                        {/* Contact Link */}
                                        <a href={`mailto:${member.email}`} className="inline-flex items-center text-slate-400 hover:text-brand transition-colors text-sm font-medium mt-auto">
                                            <Mail className="w-4 h-4 mr-2" />
                                            Email {member.name.split(' ')[0]}
                                        </a>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>

            </div>
        </main>
    );
}