import Image from 'next/image';
import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import { FileText, Download, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';

export const dynamic = 'force-dynamic';

async function getData(slug: string) {
    const client = await pool.connect();
    try {
        const commRes = await client.query('SELECT * FROM communities WHERE slug = $1', [slug]);
        if (commRes.rows.length === 0) return null;
        const community = commRes.rows[0];

        const managerRes = await client.query('SELECT * FROM managers WHERE id = $1', [community.manager_id]);
        const manager = managerRes.rows[0];

        // --- UPDATED QUERY: HIDE HIDDEN FILES ---
        const docsRes = await client.query(
            `SELECT * FROM community_downloads
             WHERE community_id = $1
             AND is_hidden = false  -- <--- CRITICAL FILTER
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

            {/* Hero Section */}
            <div className="relative h-[400px] w-full">
                <Image
                    src={community.image_url || '/hero-bg.jpg'}
                    alt={community.name}
                    fill
                    className="object-cover brightness-50"
                    priority
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                        <h1 className="text-5xl font-serif font-bold mb-4 drop-shadow-lg">{community.name}</h1>
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">{community.description}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Left Column: Info & Manager */}
                <div className="space-y-8">
                    {/* Manager Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <UserCardIcon /> Community Manager
                        </h3>
                        {manager ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {manager.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{manager.name}</p>
                                        <p className="text-sm text-slate-500">Dedicated Manager</p>
                                    </div>
                                </div>
                                <hr className="border-slate-100" />
                                <div className="space-y-3">
                                    <a href={`mailto:${manager.email}`} className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors">
                                        <Mail className="w-5 h-5" />
                                        <span className="text-sm">{manager.email}</span>
                                    </a>
                                    <a href={`tel:${manager.phone}`} className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors">
                                        <Phone className="w-5 h-5" />
                                        <span className="text-sm">{manager.phone}</span>
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-500 italic">Please contact the main office.</p>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-brand text-white p-6 rounded-2xl shadow-lg">
                        <h3 className="font-bold mb-4 text-lg">Resident Portal</h3>
                        <p className="text-brand-accent/90 text-sm mb-6">
                            Pay dues, submit work orders, and view account history.
                        </p>
                        <a
                            href={community.portal_url || "https://cfnc.cincwebaxis.com/"}
                            target="_blank"
                            className="block w-full bg-white text-brand text-center py-3 rounded-xl font-bold hover:bg-brand-accent hover:text-brand-dark transition-colors"
                        >
                            Log In to Portal
                        </a>
                    </div>
                </div>

                {/* Right Column: Documents */}
                <div className="lg:col-span-2">
                    <h2 className="text-3xl font-serif font-bold text-slate-800 mb-8">Community Documents</h2>

                    {Object.keys(groupedDocs).length > 0 ? (
                        <div className="grid gap-6">
                            {Object.entries(groupedDocs).map(([category, docs]: [string, any]) => (
                                <div key={category} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-brand" />
                                        <h3 className="font-bold text-slate-700">{category}</h3>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {docs.map((doc: any) => (
                                            <a
                                                key={doc.id}
                                                href={doc.file_url}
                                                target="_blank"
                                                className="flex items-center justify-between px-6 py-4 hover:bg-blue-50/50 transition-colors group"
                                            >
                                                <span className="text-slate-600 font-medium group-hover:text-blue-700 transition-colors">
                                                    {doc.title}
                                                </span>
                                                <Download className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-500">No documents available yet.</p>
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