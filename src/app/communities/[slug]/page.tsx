import Image from 'next/image';
import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import { FileText, Download, Phone, Mail, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import AlertBanner from '@/components/AlertBanner';

export const dynamic = 'force-dynamic';

async function getData(slug: string) {
    const client = await pool.connect();
    try {
        const commRes = await client.query('SELECT * FROM communities WHERE slug = $1', [slug]);
        if (commRes.rows.length === 0) return null;
        const community = commRes.rows[0];

        const managerRes = await client.query('SELECT * FROM managers WHERE id = $1', [community.manager_id]);
        const manager = managerRes.rows[0];

        const docsRes = await client.query(
            `SELECT * FROM community_downloads
             WHERE community_id = $1
             AND is_hidden = false
             ORDER BY category ASC, title ASC`,
            [community.id]
        );

        return { community, manager, documents: docsRes.rows };
    } finally {
        client.release();
    }
}

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug;
    const data = await getData(slug);

    if (!data) return notFound();
    const { community, manager, documents } = data;

    // Group Docs by Category
    const groupedDocs = documents.reduce((acc: any, doc: any) => {
        const cat = doc.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(doc);
        return acc;
    }, {});

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            {/* --- ALERT BANNER --- */}
            {/* Now using the columns directly from the community table */}
            <AlertBanner
                message={community.alert_message}
                type={community.alert_type}
                startTime={community.alert_start_time}
                endTime={community.alert_end_time}
            />

            {/* --- HERO SECTION --- */}
            <div className="relative h-[450px] w-full flex items-center justify-center overflow-hidden bg-brand-dark">

                {/* 1. Background Image */}
                {community.image_url ? (
                    <Image
                        src={community.image_url}
                        alt={community.name}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 bg-hero-gradient"></div>
                )}

                {/* 2. Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/20"></div>

                {/* 3. Texture Pattern */}
                <div className="absolute inset-0 bg-grid-white opacity-10 pointer-events-none"></div>

                {/* 4. Content */}
                <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-6 backdrop-blur-md">
                        <MapPin className="w-3 h-3 text-brand-accent" />
                        <span className="uppercase tracking-wider">{community.city || 'North Carolina'}</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 drop-shadow-lg tracking-tight">
                        {community.name}
                    </h1>
                    <p className="text-xl text-blue-50/90 max-w-2xl mx-auto leading-relaxed font-light">
                        {community.description}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 -mt-16 relative z-20">

                {/* Left Column: Info & Manager */}
                <div className="space-y-8">
                    {/* Manager Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-white/50 backdrop-blur-sm">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <UserCardIcon /> Community Manager
                        </h3>
                        {manager ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center text-brand font-bold text-xl border border-blue-100">
                                        {manager.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-lg">{manager.name}</p>
                                        <p className="text-sm text-slate-500">Dedicated Manager</p>
                                    </div>
                                </div>
                                <hr className="border-slate-100 my-2" />
                                <div className="space-y-3">
                                    <a href={`mailto:${manager.email}`} className="flex items-center gap-3 text-slate-600 hover:text-brand transition-colors group">
                                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">{manager.email}</span>
                                    </a>
                                    <a href={`tel:${manager.phone}`} className="flex items-center gap-3 text-slate-600 hover:text-brand transition-colors group">
                                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">{manager.phone}</span>
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-500 italic">Please contact the main office.</p>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-brand text-white p-6 rounded-2xl shadow-lg shadow-blue-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                        <h3 className="font-bold mb-2 text-lg relative z-10">Resident Portal</h3>
                        <p className="text-blue-100 text-sm mb-6 relative z-10">
                            Pay dues, submit work orders, and view account history securely online.
                        </p>
                        <a
                            href={community.portal_url || "https://cfnc.cincwebaxis.com/"}
                            target="_blank"
                            className="block w-full bg-white text-brand text-center py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-sm relative z-10"
                        >
                            Log In to Portal
                        </a>
                    </div>
                </div>

                {/* Right Column: Documents */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-1 bg-brand rounded-full"></div>
                        <h2 className="text-3xl font-serif font-bold text-slate-800">Community Documents</h2>
                    </div>

                    {Object.keys(groupedDocs).length > 0 ? (
                        <div className="grid gap-6">
                            {Object.entries(groupedDocs).map(([category, docs]: [string, any]) => (
                                <div key={category} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                    <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-brand" />
                                        <h3 className="font-bold text-slate-700">{category}</h3>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {docs.map((doc: any) => (
                                            <a
                                                key={doc.id}
                                                href={doc.file_url}
                                                target="_blank"
                                                className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/30 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-brand transition-colors"></div>
                                                    <span className="text-slate-600 font-medium group-hover:text-brand-dark transition-colors">
                                                        {doc.title}
                                                    </span>
                                                </div>
                                                <div className="p-2 rounded-full text-slate-300 group-hover:text-brand group-hover:bg-blue-100/50 transition-all">
                                                    <Download className="w-4 h-4" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-medium">No documents available yet.</p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
            <ChatWidget />
        </main>
    );
}

function UserCardIcon() {
    return (
        <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
    );
}