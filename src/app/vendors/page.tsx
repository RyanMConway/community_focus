import Link from 'next/link';
import { ExternalLink, HardHat, ShieldCheck, MapPin, CheckCircle2, Info } from 'lucide-react';
import Reveal from '@/components/Reveal';
import pool from '@/lib/db';

// Fetch vendors from DB
async function getVendors() {
    // FALLBACK for development if DB table doesn't exist yet
    try {
        const client = await pool.connect();
        try {
            const res = await client.query('SELECT * FROM vendors ORDER BY name ASC');
            return res.rows;
        } catch (e) {
             console.warn("Vendor table not found, using fallback.");
             return [];
        } finally {
            client.release();
        }
    } catch (e) {
        return [];
    }
}

export default async function VendorsPage() {
    const vendors = await getVendors();

    return (
        <main className="min-h-screen bg-slate-50 pb-20">

            {/* HERO */}
            <div className="bg-brand-dark text-white pt-32 pb-20 px-6 text-center relative overflow-hidden">
                <div className="relative z-10 max-w-4xl mx-auto">
                    <Reveal>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Trusted Vendor Network</h1>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <p className="text-blue-100 text-lg md:text-xl font-light leading-relaxed">
                            We maintain a broad and diverse network of industry professionals to ensure every project is handled by the right expert.
                        </p>
                    </Reveal>
                </div>
                <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')]"></div>
            </div>

            <div className="container mx-auto px-6 -mt-10 relative z-20">

                {/* VENDORS GRID */}
                {vendors.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100 mb-20">
                        <p className="text-slate-500">Our vendor list is currently being updated. Please check back soon.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                        {vendors.map((vendor: any, idx: number) => (
                            <Reveal key={vendor.id} delay={idx * 0.1}>
                                <div className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between">
                                    <div>
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                                            <HardHat className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">{vendor.name}</h3>
                                        <p className="text-slate-500 font-medium">{vendor.specialty}</p>
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-slate-50">
                                        <Link href={vendor.website_url || "#"} className="inline-flex items-center text-sm font-bold text-brand hover:text-brand-dark transition-colors">
                                            Visit Website <ExternalLink className="w-4 h-4 ml-2" />
                                        </Link>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                )}

                {/* ... existing "Why We Partner" and "Professional Note" sections ... */}
                 <div className="mb-20">
                    <div className="text-center mb-12">
                        <Reveal>
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Why We Partner with the Best</h2>
                            <p className="text-slate-500 max-w-2xl mx-auto">We don't just hire anyone. We select our partners based on strict criteria to ensure the safety and value of your community.</p>
                        </Reveal>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Reveal delay={0.1}>
                            <div className="bg-white p-8 rounded-2xl border border-slate-200/60 text-center">
                                <div className="mx-auto w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4">
                                    <MapPin className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-2">Local Expertise</h3>
                                <p className="text-slate-600 text-sm">Proven experience serving Raleigh, Durham, and the surrounding areas.</p>
                            </div>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <div className="bg-white p-8 rounded-2xl border border-slate-200/60 text-center">
                                <div className="mx-auto w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-brand mb-4">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-2">Licensing & Insurance</h3>
                                <p className="text-slate-600 text-sm">Ensuring every job is performed safely, legally, and with proper liability coverage.</p>
                            </div>
                        </Reveal>
                        <Reveal delay={0.3}>
                            <div className="bg-white p-8 rounded-2xl border border-slate-200/60 text-center">
                                <div className="mx-auto w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-4">
                                    <CheckCircle2 className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-2">Craftsmanship</h3>
                                <p className="text-slate-600 text-sm">A shared dedication to "doing the job right the first time" and standing by the work.</p>
                            </div>
                        </Reveal>
                    </div>
                </div>

                {/* PROFESSIONAL NOTE */}
                <Reveal>
                    <div className="bg-slate-900 text-slate-300 p-8 md:p-12 rounded-3xl flex gap-6 items-start shadow-xl">
                        <Info className="w-8 h-8 text-brand-accent flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="text-white font-bold text-lg mb-2">Professional Note</h4>
                            <p className="leading-relaxed text-slate-400">
                                This list represents only a small portion of our total vendor network. We work with a wide variety of specialized contractors and suppliers to ensure we provide the best possible solution for every unique client need.
                            </p>
                        </div>
                    </div>
                </Reveal>
            </div>
        </main>
    );
}