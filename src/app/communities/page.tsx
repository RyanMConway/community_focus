import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight, Search } from 'lucide-react';
import pool from '@/lib/db';
import Reveal from '@/components/Reveal';

// Fetch communities from the database
async function getCommunities() {
    const client = await pool.connect();
    try {
        // Fetch all communities, sorted alphabetically
        const res = await client.query('SELECT * FROM communities ORDER BY name ASC');
        return res.rows;
    } finally {
        client.release();
    }
}

export default async function CommunitiesPage() {
    const communities = await getCommunities();

    return (
        <main className="min-h-screen bg-slate-50 pt-24 pb-20">
            {/* Header */}
            <div className="bg-brand-dark text-white py-16 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl font-serif font-bold mb-4">Our Communities</h1>
                    <p className="text-brand-accent text-lg max-w-2xl mx-auto">
                        Community Focus of NC is proud to manage these distinctive neighborhoods across the Triangle.
                    </p>
                </div>
                {/* Background Shapes */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* List Section */}
            <div className="max-w-7xl mx-auto px-6 py-12">

                {/* Search / Filter Placeholder (Visual only for now) */}
                <div className="mb-12 flex justify-center">
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Search for a community..."
                            className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent shadow-sm"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communities.map((community, index) => (
                        <Reveal key={community.id} delay={index * 0.05}>
                            <Link href={`/communities/${community.slug}`} className="block group h-full">
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                                    {/* Image Placeholder - You can add a 'image_url' column to DB later */}
                                    <div className="h-48 bg-slate-200 relative">
                                        {/* If you have images, use <Image /> here. For now, a pattern: */}
                                        <div className="absolute inset-0 bg-brand/5 flex items-center justify-center text-brand/20">
                                            <MapPin className="w-16 h-16" />
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-brand transition-colors">
                                            {community.name}
                                        </h3>

                                        <div className="flex items-center text-slate-500 text-sm mb-4">
                                            <MapPin className="w-4 h-4 mr-1 text-brand-accent" />
                                            {community.city || "North Carolina"}
                                        </div>

                                        <p className="text-slate-600 text-sm line-clamp-2 mb-6 flex-1">
                                            {community.description || "A professionally managed community by Community Focus of NC."}
                                        </p>

                                        <div className="flex items-center text-brand font-bold text-sm mt-auto">
                                            View Community <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </Reveal>
                    ))}
                </div>

                {communities.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-500">No communities found. Please check the database connection.</p>
                    </div>
                )}
            </div>
        </main>
    );
}