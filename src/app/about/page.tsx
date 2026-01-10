import Image from 'next/image';
import { Award, Users, Heart, Target } from 'lucide-react';
import Reveal from '@/components/Reveal';

export default function AboutPage() {

    // --- TEAM DATA ---
    const team = [
        {
            name: "Josh Lindgren",
            role: "Owner",
            image: "/team/josh-lindgren.jpg",
            // Professional placeholder bio - ready to use or edit
            bio: "As the owner of Community Focus, Josh is dedicated to redefining the property management experience in North Carolina. With a passion for community building and operational excellence, he leads the team in delivering transparent, responsive, and personalized service to every association we manage."
        },
        {
            name: "Robin Conway",
            role: "VP of Association Services",
            image: "/team/robin-conway.jpg",
            bio: "Robin brings a wealth of leadership experience to Community Focus. As a former partner in the commercial lighting industry, she specializes in building strong, transparent relationships with HOA boards and vendors. A Chapel Hill resident of 37 years, she is dedicated to ensuring every community receives proactive management and personalized care."
        },
        // Add more team members here...
    ];

    return (
        <main className="min-h-screen bg-slate-50 pt-24 pb-20">
            {/* Hero Section */}
            <div className="bg-brand-dark text-white py-20 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">About Community Focus</h1>
                    <p className="text-xl text-brand-accent max-w-2xl mx-auto font-light leading-relaxed">
                        Redefining property management with a personal touch. We believe in transparency, communication, and community.
                    </p>
                </div>
                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* Mission Section */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                    <Reveal>
                        <h2 className="text-3xl font-serif font-bold text-slate-800 mb-6">Our Mission</h2>
                        <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
                            <p>
                                At Community Focus of NC, we understand that an HOA is more than just a corporation—it is a neighborhood. Our mission is to protect property values while fostering a sense of community that makes residents proud to call their neighborhood home.
                            </p>
                            <p>
                                We leverage modern technology to streamline operations, but we never lose the human element. Whether it is a late-night emergency or a simple question about architectural guidelines, our team is here to listen and serve.
                            </p>
                        </div>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                                <Users className="w-10 h-10 text-brand mb-4" />
                                <h3 className="font-bold text-slate-800">Community First</h3>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                                <Award className="w-10 h-10 text-brand mb-4" />
                                <h3 className="font-bold text-slate-800">Excellence</h3>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                                <Heart className="w-10 h-10 text-brand mb-4" />
                                <h3 className="font-bold text-slate-800">Transparency</h3>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                                <Target className="w-10 h-10 text-brand mb-4" />
                                <h3 className="font-bold text-slate-800">Results</h3>
                            </div>
                        </div>
                    </Reveal>
                </div>

                {/* Team Section */}
                <div className="mb-20">
                    <h2 className="text-3xl font-serif font-bold text-slate-800 mb-12 text-center">Meet Our Leadership</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {team.map((member, index) => (
                            <Reveal key={index} delay={index * 0.1}>
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow group">
                                    {/* Image Container */}
                                    <div className="relative h-80 w-full bg-slate-200 overflow-hidden">
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            fill
                                            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Text Content */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-slate-800 mb-1">{member.name}</h3>
                                        <p className="text-brand font-medium text-sm uppercase tracking-wider mb-4">{member.role}</p>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            {member.bio}
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}

                        {/* Hiring / Contact Card */}
                        <Reveal delay={0.3}>
                            <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 h-full min-h-[400px] flex flex-col items-center justify-center p-6 text-center hover:border-brand/50 transition-colors">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <Users className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700">Join Our Team</h3>
                                <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                                    We are always looking for dedicated professionals to join the Community Focus family.
                                </p>
                                <a href="/contact" className="mt-6 text-brand font-bold text-sm hover:underline">Contact Us &rarr;</a>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </main>
    );
}