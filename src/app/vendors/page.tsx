import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, HardHat, ShieldCheck, MapPin, CheckCircle2, Info } from 'lucide-react';
import Reveal, { RevealItem } from '@/components/Reveal';
import PageHeader from '@/components/PageHeader';
import pool from '@/lib/db';

export const metadata: Metadata = {
  title: 'Trusted Vendor Network',
  description:
    'Community Focus of NC partners with local, licensed vendors for landscaping, maintenance, and repairs across all managed communities.',
};

async function getVendors() {
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
            <PageHeader
                eyebrow="Our Network"
                title="Trusted Vendor Network"
                subtitle="We maintain a broad and diverse network of industry professionals to ensure every project is handled by the right expert."
            />

            <div className="container mx-auto px-6 pt-6 relative z-20">

                {/* VENDORS GRID */}
                {vendors.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100 mb-20">
                        <HardHat className="w-12 h-12 text-slate-300 mx-auto mb-4" strokeWidth={1} />
                        <p className="text-slate-600 font-medium mb-1">Our vendor list is currently being updated.</p>
                        <p className="text-slate-400 text-sm">Please check back soon.</p>
                    </div>
                ) : (
                    <Reveal width="100%" stagger>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                            {vendors.map((vendor: any) => (
                                <RevealItem key={vendor.id}>
                                    <div className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-card-hover hover:border-brand/20 transition-all duration-300 h-full flex flex-col justify-between relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-brand-accent to-brand-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div>
                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-brand group-hover:bg-brand group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                                <HardHat className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-2">{vendor.name}</h3>
                                            <p className="text-slate-500 font-medium">{vendor.specialty}</p>
                                        </div>
                                        <div className="mt-8 pt-6 border-t border-slate-100">
                                            <Link href={vendor.website_url || "#"} className="inline-flex items-center text-sm font-bold text-brand hover:text-brand-dark transition-colors">
                                                Visit Website <ExternalLink className="w-4 h-4 ml-2" />
                                            </Link>
                                        </div>
                                    </div>
                                </RevealItem>
                            ))}
                        </div>
                    </Reveal>
                )}

                {/* WHY WE PARTNER */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <Reveal width="100%">
                            <div className="flex flex-col items-center">
                                <span className="text-brand-gold font-bold tracking-wider uppercase text-xs mb-4">
                                    Our Standards
                                </span>
                                <h2 className="text-3xl font-serif font-bold mb-4">
                                    <span className="text-gradient">Why We Partner with the Best</span>
                                </h2>
                                <p className="text-slate-500 max-w-2xl mx-auto">
                                    We don't just hire anyone. We select our partners based on strict criteria to ensure the safety and value of your community.
                                </p>
                            </div>
                        </Reveal>
                    </div>

                    <Reveal width="100%" stagger>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: MapPin,
                                    color: 'green',
                                    bg: 'bg-green-50',
                                    text: 'text-green-600',
                                    title: 'Local Expertise',
                                    desc: 'Proven experience serving Raleigh, Durham, and the surrounding areas.'
                                },
                                {
                                    icon: ShieldCheck,
                                    color: 'blue',
                                    bg: 'bg-blue-50',
                                    text: 'text-brand',
                                    title: 'Licensing & Insurance',
                                    desc: 'Ensuring every job is performed safely, legally, and with proper liability coverage.'
                                },
                                {
                                    icon: CheckCircle2,
                                    color: 'purple',
                                    bg: 'bg-purple-50',
                                    text: 'text-purple-600',
                                    title: 'Craftsmanship',
                                    desc: 'A shared dedication to "doing the job right the first time" and standing by the work.'
                                },
                            ].map((item, idx) => (
                                <RevealItem key={idx}>
                                    <div className="group bg-white p-8 rounded-2xl border border-slate-200/60 text-center hover:shadow-card-hover hover:border-brand/20 transition-all duration-300 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-brand-accent to-brand-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className={`mx-auto w-14 h-14 ${item.bg} rounded-full flex items-center justify-center ${item.text} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                            <item.icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-800 mb-2">{item.title}</h3>
                                        <p className="text-slate-600 text-sm">{item.desc}</p>
                                    </div>
                                </RevealItem>
                            ))}
                        </div>
                    </Reveal>
                </div>

                {/* PROFESSIONAL NOTE */}
                <Reveal>
                    <div className="relative bg-gradient-mesh rounded-3xl overflow-hidden p-8 md:p-12 flex gap-6 items-start shadow-xl">
                        <div className="absolute inset-0 bg-grid-white opacity-10 pointer-events-none" />
                        <Info className="w-8 h-8 text-brand-accent flex-shrink-0 mt-1 relative z-10" />
                        <div className="relative z-10">
                            <h4 className="text-white font-bold text-lg mb-2">Professional Note</h4>
                            <p className="leading-relaxed text-blue-100/80">
                                This list represents only a small portion of our total vendor network. We work with a wide variety of specialized contractors and suppliers to ensure we provide the best possible solution for every unique client need.
                            </p>
                        </div>
                    </div>
                </Reveal>
            </div>
        </main>
    );
}
