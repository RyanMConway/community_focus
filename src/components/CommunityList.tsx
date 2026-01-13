"use client";

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Search, X } from 'lucide-react';
import Reveal from '@/components/Reveal';

// Define the shape of the data we expect
interface Community {
    id: number;
    slug: string;
    name: string;
    city: string | null;
    description?: string | null;
}

export default function CommunityList({ communities }: { communities: Community[] }) {
    const [query, setQuery] = useState('');

    // Filter logic: Search by Name OR City
    const filtered = communities.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.city && c.city.toLowerCase().includes(query.toLowerCase()))
    );

    return (
        <>
            {/* Search Bar Section */}
            <div className="mb-12 flex justify-center">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Search for a community..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-12 pr-10 py-3 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent shadow-sm transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />

                    {/* Clear Button */}
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((community, index) => (
                    <Reveal key={community.id} delay={index * 0.05}>
                        <Link href={`/communities/${community.slug}`} className="block group h-full">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                                {/* Image Placeholder */}
                                <div className="h-48 bg-slate-200 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-brand/5 flex items-center justify-center text-brand/20 group-hover:bg-brand/10 transition-colors">
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

            {/* Empty State */}
            {filtered.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-700">No communities found</h3>
                    <p className="text-slate-500 mb-4">We couldn't find matches for "{query}"</p>
                    <button
                        onClick={() => setQuery('')}
                        className="text-brand font-bold hover:underline"
                    >
                        Clear Search
                    </button>
                </div>
            )}
        </>
    );
}