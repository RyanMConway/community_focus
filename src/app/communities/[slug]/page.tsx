import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, ArrowLeft, MapPin, FileText, Download, ShieldAlert, Home, Phone } from 'lucide-react';
import pool from '@/lib/db';

// --- DATA FETCHING ---
async function getData(slug: string) {
    const client = await pool.connect();
    try {
        // 1. Get Community Details
        const commRes = await client.query(
            'SELECT * FROM communities WHERE slug = $1',
            [slug]
        );
        const community = commRes.rows[0];

        if (!community) return null;

        // 2. Get Downloads/Documents
        const docsRes = await client.query(
            `SELECT * FROM community_downloads 
             WHERE community_id = $1 
             ORDER BY category ASC, title ASC`,
            [community.id]
        );

        return { community, documents: docsRes.rows };
    } finally {
        client.release();
    }
}

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await getData(slug);

    // If community doesn't exist, show 404
    if (!data) {
        notFound();
    }

    const { community, documents } = data;

    // Filter documents into categories
    // 'Governing' = CCRs, Bylaws (Blue Icon)
    // 'Forms' = ARC, Parking (Green Icon)
    // Everything else = General (Gray Icon)
    const governingDocs = documents.filter((d: any) => d.category === 'Governing');
    const forms = documents.filter((d: any) => d.category === 'Forms');
    const otherDocs = documents.filter((d: any) => d.category !== 'Governing' && d.category !== 'Forms');

    return (
        <main className="min-h-screen bg-slate-50 pt-20">
            {/* Hero Header */}
            <div className="relative h-64 md:h-80 bg-brand-dark overflow-hidden">
                {/* Abstract BG */}
                <div className="absolute top-0 left-0 w-full h-full bg-brand-dark">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                </div>

                <div className="relative z-20 container mx-auto px-6 h-full flex flex-col justify-end pb-8 text-white">
                    <Link href="/communities" className="inline-flex items-center text-blue-200 hover:text-white mb-4 transition-colors w-fit">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Communities
                    </Link>
                    <h1 className="text-4xl font-serif font-bold mb-2">{community.name}</h1>
                    <div className="flex items-center text-blue-100/80 gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{community.city || "North Carolina"}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* LEFT COLUMN: Main Info & Documents */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* About Section */}
                        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-serif font-bold text-slate-800 mb-4">About the Community</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                {community.description || `Welcome to ${community.name}. We are proud to be managed by Community Focus of NC. This page provides residents with access to governing documents, architectural forms, and community updates.`}
                            </p>
                        </section>

                        {/* Documents Section */}
                        <section>
                            <h2 className="text-2xl font-serif font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-brand" />
                                Community Documents
                            </h2>

                            {documents.length === 0 ? (
                                <div className="bg-slate-100 rounded-xl p-8 text-center border border-slate-200 border-dashed">
                                    <p className="text-slate-500">No documents have been uploaded for this community yet.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {/* 1. Governing Documents Group */}
                                    {governingDocs.length > 0 && (
                                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 font-bold text-slate-700">
                                                Governing Documents
                                            </div>
                                            <div className="divide-y divide-slate-50">
                                                {governingDocs.map((doc: any) => (
                                                    <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-50 text-brand rounded-lg group-hover:bg-brand group-hover:text-white transition-colors">
                                                                <FileText className="w-5 h-5" />
                                                            </div>
                                                            <span className="font-medium text-slate-700">{doc.title}</span>
                                                        </div>
                                                        <Download className="w-4 h-4 text-slate-300 group-hover:text-brand" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. Forms Group */}
                                    {forms.length > 0 && (
                                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 font-bold text-slate-700">
                                                Architectural & Forms
                                            </div>
                                            <div className="divide-y divide-slate-50">
                                                {forms.map((doc: any) => (
                                                    <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                                                                <Home className="w-5 h-5" />
                                                            </div>
                                                            <span className="font-medium text-slate-700">{doc.title}</span>
                                                        </div>
                                                        <Download className="w-4 h-4 text-slate-300 group-hover:text-green-600" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. General Docs */}
                                    {otherDocs.length > 0 && (
                                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 font-bold text-slate-700">
                                                General Info
                                            </div>
                                            <div className="divide-y divide-slate-50">
                                                {otherDocs.map((doc: any) => (
                                                    <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-medium text-slate-700">{doc.title}</span>
                                                        </div>
                                                        <Download className="w-4 h-4 text-slate-300" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* DISCLAIMER SECTION */}
                        <section className="bg-amber-50 p-6 rounded-xl border border-amber-100 text-sm text-amber-900/80 leading-relaxed">
                            <h4 className="font-bold flex items-center gap-2 mb-2 text-amber-800">
                                <ShieldAlert className="w-4 h-4" /> Important Disclaimer
                            </h4>
                            <p className="mb-2">
                                The documents provided on this website are for informational purposes only and may not represent the most current recorded versions. While we make every effort to keep these documents updated, Community Focus of NC cannot guarantee their accuracy or completeness.
                            </p>
                            <p>
                                Official, recorded copies of Covenants, Bylaws, and Restrictions should be obtained directly from the Register of Deeds in the county where the property is located. Community Focus of NC assumes no liability for any reliance on the documents provided here.
                            </p>
                        </section>

                    </div>

                    {/* RIGHT COLUMN: Sidebar Actions */}
                    <div className="space-y-6">
                        {/* Portal Card */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-brand sticky top-24">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Resident Portal</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Log in to pay dues, view your account history, and submit work orders.
                            </p>

                            <a
                                // Use specific URL if exists, otherwise fallback to master
                                href={community.portal_url || "https://cfnc.cincwebaxis.com"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-brand-dark hover:bg-brand text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md mb-4"
                            >
                                <span>Go to CINC Portal</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>

                            <div className="border-t border-slate-100 pt-4 mt-4">
                                <h4 className="font-bold text-sm text-slate-700 mb-2">Management Contacts</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span>(919) 564-9134</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <div className="w-4 h-4 flex items-center justify-center">@</div>
                                        <a href="mailto:info@communityfocusnc.com" className="hover:text-brand">info@communityfocusnc.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}