import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, ArrowLeft, MapPin, FileText, ShieldAlert, Phone, Calendar, Megaphone, Clock } from 'lucide-react';
import pool from '@/lib/db';
import AnimatedDocList from '@/components/AnimatedDocList';
import AlertBanner from '@/components/AlertBanner';

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

        // Mocking News/Events fetch for now (replace with actual DB calls)
        const newsRes = await client.query('SELECT * FROM community_news WHERE community_id = $1 ORDER BY created_at DESC LIMIT 5', [community.id]).catch(() => ({ rows: [] }));
        const eventsRes = await client.query('SELECT * FROM community_events WHERE community_id = $1 AND event_date >= NOW() ORDER BY event_date ASC LIMIT 3', [community.id]).catch(() => ({ rows: [] }));

        return { community, documents: docsRes.rows, news: newsRes.rows, events: eventsRes.rows };
    } finally {
        client.release();
    }
}

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await getData(slug);

    if (!data) notFound();

    const { community, documents, news, events } = data;

    const governingDocs = documents.filter((d: any) => d.category === 'Governing');
    const forms = documents.filter((d: any) => d.category === 'Forms');
    const otherDocs = documents.filter((d: any) => d.category !== 'Governing' && d.category !== 'Forms');

    return (
        <main className="min-h-screen bg-slate-50 pb-20">

            <AlertBanner
                message={community.alert_message}
                type={community.alert_type}
                startTime={community.alert_start_time}
                endTime={community.alert_end_time}
            />

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
                                {community.description || `Welcome to ${community.name}. We are proud to be managed by Community Focus of NC.`}
                            </p>
                        </div>

                         {/* News Feed Section (NEW) */}
                        {news.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Megaphone className="w-5 h-5 text-brand" />
                                    Community Announcements
                                </h2>
                                <div className="space-y-4">
                                    {news.map((item: any) => (
                                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-slate-800">{item.title}</h3>
                                                <span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-slate-600 text-sm">{item.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
                                    Official, recorded copies of Covenants, Bylaws, and Restrictions should be obtained directly from the Register of Deeds.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Sticky Sidebar */}
                    <div className="space-y-6">
                        <div className="sticky top-24 space-y-6">

                            {/* Portal Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                                <div className="bg-gradient-to-r from-brand to-brand-accent h-1.5 w-full absolute top-0 left-0 rounded-t-2xl"></div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2 mt-2">Resident Portal</h3>
                                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                    Log in to your secure account to pay dues, view history, and submit work orders.
                                </p>

                                {community.portal_url && (
                                     <a
                                        href={community.portal_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 mb-6 group"
                                    >
                                        <span>Go to Portal</span>
                                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                                    </a>
                                )}

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

                            {/* Events Widget (NEW) */}
                            {events.length > 0 && (
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-brand" /> Upcoming Events
                                    </h3>
                                    <div className="space-y-4">
                                        {events.map((event: any) => (
                                            <div key={event.id} className="flex gap-3 items-start border-l-2 border-blue-200 pl-3">
                                                <div>
                                                    <div className="font-bold text-slate-700 text-sm">{event.title}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(event.event_date).toLocaleDateString()} at {event.event_time}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}