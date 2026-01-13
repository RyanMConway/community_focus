"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, Home } from 'lucide-react';

interface Community {
    id: number;
    name: string;
    slug: string;
}

export default function CommunitySearchGrid({ communities }: { communities: Community[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = communities.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Enhanced Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-16 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand via-brand-accent to-brand rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-brand transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by community name..."
                        className="w-full pl-14 pr-4 py-5 rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 focus:outline-none focus:ring-2 focus:ring-brand/20 text-lg placeholder:text-slate-400 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((comm) => (
                        <Link
                            key={comm.id}
                            href={`/communities/${comm.slug}`}
                            className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col items-start h-full"
                        >
                            <div className="w-full flex items-center justify-between mb-4">
                                <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                                    <Home className="w-6 h-6 text-brand group-hover:text-white" />
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand" />
                                </div>
                            </div>

                            <h3 className="font-bold text-slate-800 text-lg group-hover:text-brand transition-colors">
                                {comm.name}
                            </h3>
                            <p className="text-sm text-slate-400 mt-2">View documents & news</p>
                        </Link>
                    ))}
                </div>
            ) : (
                // Improved Empty State
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No communities found</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mb-8">
                        We couldn't find "{searchTerm}". Try checking the spelling or view our full list.
                    </p>
                    <button
                        onClick={() => setSearchTerm('')}
                        className="text-brand font-bold hover:underline"
                    >
                        Clear Search
                    </button>
                </div>
            )}
        </div>
    );
}