import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, ArrowLeft, MapPin, FileText, ShieldAlert, Phone } from 'lucide-react';
import pool from '@/lib/db';
import AnimatedDocList from '@/components/AnimatedDocList';
import AlertBanner from '@/components/AlertBanner'; // <--- Import

async function getData(slug: string) {
    const client = await pool.connect();
    try {
        const commRes = await client.query('SELECT * FROM communities WHERE slug = $1', [slug]);
        const community = commRes.rows[0];
        if (!community) return null;

        const docsRes = await client.query(
            `SELECT * FROM community_downloads WHERE community_id = $1 ORDER BY category ASC, title ASC`,
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

    if (!data) notFound();

    const { community, documents } = data;

    const governingDocs = documents.filter((d: any) => d.category === 'Governing');
    const forms = documents.filter((d: any) => d.category === 'Forms');
    const otherDocs = documents.filter((d: any) => d.category !== 'Governing' && d.category !== 'Forms');

    return (
        <main className="min-h-screen bg-slate-50 pb-20">

            {/* --- NEW ALERT BANNER --- */}
            <AlertBanner message={community.alert_message} type={community.alert_type} />

            {/* HERO */}
            <div className="relative pt-32 pb-20 bg-brand-dark overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')]"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand/20 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-20 container mx-auto px-6">
                    <Link href="/communities" className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Communities
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">{community.name}</h1>
                    <div className="flex items-center text-blue-100/90 gap-2 text-lg">
                        <MapPin className="w-5 h-5 text-brand-accent" />
                        <span>{community.city || "North Carolina"}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 -mt-10 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* About Section */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">About the Community</h2>
                            <p className="text-slate-600 leading-relaxed">
                                {community.description || `Welcome to ${community.name}. We are proud to be managed by Community Focus of NC. This page provides residents with access to governing documents, architectural forms, and community updates.`}
                            </p>
                        </div>

                        {/* Documents Section */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-brand" />
                                Community Documents
                            </h2>

                            {documents.length === 0 ? (
                                <div className="bg-slate-100 rounded-xl p-12 text-center border border-slate-200 border-dashed">
                                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No documents available yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <AnimatedDocList title="Governing Documents" docs={governingDocs} type="governing" delay={0.1} />
                                    <AnimatedDocList title="Architectural & Forms" docs={forms} type="forms" delay={0.2} />
                                    <AnimatedDocList title="General Info" docs={otherDocs} type="general" delay={0.3} />
                                </div>
                            )}
                        </div>

                        {/* Disclaimer */}
                        <div className="bg-amber-50 p-6 rounded-xl border border-amber-100/50 text-sm text-amber-900/70 leading-relaxed flex gap-4">
                            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="mb-2 font-bold text-amber-800">Important Disclaimer</p>
                                <p>
                                    Official, recorded copies of Covenants, Bylaws, and Restrictions should be obtained directly from the Register of Deeds. Community Focus of NC assumes no liability for any reliance on the documents provided here.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Sticky Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
                            <div className="bg-gradient-to-r from-brand to-brand-accent h-1.5 w-full absolute top-0 left-0"></div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2 mt-2">Resident Portal</h3>
                            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                Log in to your secure account to pay dues, view history, and submit work orders.
                            </p>

                            <a
                                href={community.portal_url || "https://cfnc.cincwebaxis.com"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 mb-6 group"
                            >
                                <span>Go to CINC Portal</span>
                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                            </a>

                            <div className="border-t border-slate-100 pt-6">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4">Support</h4>
                                <div className="space-y-3 text-sm font-medium">
                                    <a href="tel:9195649134" className="flex items-center gap-3 text-slate-600 hover:text-brand transition-colors p-2 hover:bg-slate-50 rounded-lg -ml-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Phone className="w-4 h-4" /></div>
                                        (919) 564-9134
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}