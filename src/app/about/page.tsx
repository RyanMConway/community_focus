import Image from 'next/image';
import { Mail, Phone, Shield, Users, Heart, User } from 'lucide-react'; // Added User icon
import Reveal from '@/components/Reveal';

// 1. Define the President separately
const president = {
    name: "Josh Lindgren",
    title: "President",
    image: "/team/josh-lindgren.jpg",
    bio: "Expert in property maintenance and vendor coordination, ensuring that your community always looks its best.",
    email: "Josh@communityfocusnc.com",
    phone: "(919) 564-9134 ext. 101"
};

// 2. Define the rest of the team (Sorted by Last Name)
const staff = [
    {
        name: "Lisa Austin",
        title: "Association Services",
        image: "/team/lisa-austin.jpg",
        bio: "Providing essential support to ensure our communities run smoothly.",
        email: "Lisa@CommunityFocusNC.com",
        phone: "(919) 564-9134 ext. 106"
    },
    {
        name: "Robin Conway",
        title: "Vice President Association Services",
        image: "/team/robin-conway.jpg",
        bio: "Dedicated to building strong community relationships and ensuring transparent management for all our associations.",
        email: "robin@communityfocusnc.com",
        phone: "(919) 564-9134 ext. 104"
    },
    {
        name: "Amy Ghiloni",
        title: "Community Association Manager",
        image: "/team/amy-ghiloni.png",
        bio: "Dedicated to supporting board members and homeowners with clear communication.",
        email: "Amy@CommunityFocusNC.com",
        phone: "(919) 564-9134 ext. 109"
    },
    {
        name: "Madison Kichline",
        title: "Vice President of Operations",
        image: "/team/madison.png",
        bio: "Madison brings a wealth of operational expertise to the team, overseeing day-to-day excellence.",
        email: "Madison@communityfocusNC.com",
        phone: "(919) 564-9134 ext. 102"
    },
    {
        name: "Tracy Lynn",
        title: "Compliance Manager",
        image: "/team/silhouette.png",
        bio: "Ensuring community standards are met with fairness and consistency.",
        email: "Tracy@CommunityFocusNC.com",
        phone: null
    },
    {
        name: "Tristan McInturff",
        title: "On-Site Inspections / Compliance",
        image: "/team/silhouette.png",
        bio: "Conducting thorough on-site inspections to maintain community value.",
        email: "Tristan@CommunityFocusNC.com",
        phone: null
    },
    {
        name: "Shan Wofford",
        title: "Assistant Manager",
        image: "/team/silhouette.png",
        bio: "Focused on efficient community management and solving complex association challenges.",
        email: "Shan@CommunityFocusNC.com",
        phone: "(540) 632-6388"
    },
    {
        name: "Wade Womble",
        title: "Community Association Manager",
        image: "/team/wade-womble.jpg",
        bio: "Focused on efficient community management and solving complex association challenges.",
        email: "Wade@CommunityFocusNC.com",
        phone: "(919) 564-9134 ext. 108"
    },
];

// Reusable Card Component
function TeamCard({ member }: { member: any }) {
    return (
        <div className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all h-full flex flex-col">

            {/* Image Area */}
            <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                {member.image ? (
                    <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    // --- UPDATED PLACEHOLDER: PROFESSIONAL SILHOUETTE ---
                    <div className="w-full h-full flex items-end justify-center bg-gradient-to-b from-slate-100 to-slate-200">
                         {/* Large silhouette icon positioned at the bottom to look like a bust */}
                        <User className="w-40 h-40 text-slate-300/80 translate-y-4" strokeWidth={1} />
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-6 flex-1 flex flex-col text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-1">{member.name}</h3>
                <p className="text-brand font-medium text-sm mb-4 h-10 flex items-center justify-center">{member.title}</p>

                <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                    {member.bio}
                </p>

                <div className="mt-auto space-y-2 w-full">
                    <a href={`mailto:${member.email}`} className="flex items-center justify-center text-slate-500 hover:text-brand transition-colors text-sm font-medium p-2 rounded-lg hover:bg-slate-50">
                        <Mail className="w-4 h-4 mr-2" />
                        {member.email.split('@')[0]}
                    </a>

                    {member.phone && (
                        <div className="flex items-center justify-center text-slate-500 text-sm font-medium p-2">
                            <Phone className="w-4 h-4 mr-2 text-slate-400" />
                            {member.phone}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-slate-50 pb-20">

            {/* HEADER */}
            <div className="bg-brand-dark text-white pt-32 pb-20 px-6 relative overflow-hidden mb-20">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <Reveal width="100%">
                        <div className="flex flex-col items-center">
                            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Community First</h1>
                            <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
                                We founded Community Focus of NC with a simple belief: HOAs should build communities, not just collect dues.
                                We believe in transparency, responsiveness, and treating every homeowner with respect.
                            </p>
                        </div>
                    </Reveal>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
            </div>

            <div className="container mx-auto px-6">
                {/* 2. Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <Reveal delay={0.1}>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:-translate-y-1 transition-transform h-full">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-brand">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Integrity</h3>
                            <p className="text-slate-600">We operate with complete financial transparency. No hidden fees, no surprises.</p>
                        </div>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:-translate-y-1 transition-transform h-full">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-brand">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Communication</h3>
                            <p className="text-slate-600">We answer the phone. We reply to emails. We are here when you need us.</p>
                        </div>
                    </Reveal>
                    <Reveal delay={0.3}>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:-translate-y-1 transition-transform h-full">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-brand">
                                <Heart className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Care</h3>
                            <p className="text-slate-600">We treat your neighborhood like it's our own, focusing on long-term value.</p>
                        </div>
                    </Reveal>
                </div>

                {/* 3. TEAM SECTION */}
                <div className="mb-20">
                    <div className="text-center mb-16">
                        <Reveal width="100%">
                            <div className="flex flex-col items-center">
                                <h2 className="text-3xl font-bold text-slate-800 mb-4">Our Team</h2>
                                <div className="w-16 h-1 bg-brand rounded-full mb-4"></div>
                                <p className="text-slate-500 max-w-2xl text-center">
                                    The dedicated professionals working every day to support your community.
                                </p>
                            </div>
                        </Reveal>
                    </div>

                    {/* A. President Section (Centered, Same width as others) */}
                    <div className="flex justify-center mb-12">
                        <div className="w-full md:w-[calc(33.333%-1.5rem)] min-w-[300px] max-w-sm">
                            <Reveal delay={0}>
                                <TeamCard member={president} />
                            </Reveal>
                        </div>
                    </div>

                    {/* B. Staff Grid (Sorted Alphabetically by Last Name) */}
                    <div className="flex flex-wrap justify-center gap-8">
                        {staff.map((member, idx) => (
                            <div key={idx} className="w-full md:w-[calc(33.333%-1.5rem)] min-w-[300px] max-w-sm">
                                <Reveal delay={0.1 + (idx * 0.05)}>
                                    <TeamCard member={member} />
                                </Reveal>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}