"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Building2, MapPin, ArrowRight, Search, X } from 'lucide-react';

// Define the shape of our data
interface Community {
    id: number;
    slug: string;
    name: string;
    city: string | null;
}

export default function CommunitySearchGrid({ communities }: { communities: Community[] }) {
    const [query, setQuery] = useState('');

    // Filter the list based on the search query
    const filtered = communities.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.city && c.city.toLowerCase().includes(query.toLowerCase()))
    );

    return (
        <div>
            {/* Search Bar Section */}
            <div className="max-w-xl mx-auto mb-12 relative z-30">
                <div className="relative shadow-lg rounded-full"> {/* Added shadow container */}
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <input
                        type="text"
                        placeholder="Search by community name..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        // ADDED: bg-white to prevent transparency issues
                        className="w-full pl-12 pr-12 py-4 rounded-full bg-white border border-gray-200 shadow-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none text-lg transition-all relative z-0"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">
                    Showing {filtered.length} of {communities.length} communities
                </p>
            </div>

            {/* Results Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((community) => (
                        <Link
                            key={community.id}
                            href={`/communities/${community.slug}`}
                            className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-brand group-hover:text-white transition-colors">
                                    <Building2 className="w-6 h-6 text-brand group-hover:text-white" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-brand transition-colors" />
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-brand transition-colors">
                                {community.name}
                            </h3>

                            <div className="flex items-center text-gray-500 text-sm mt-auto">
                                <MapPin className="w-4 h-4 mr-1" />
                                {community.city || "Durham, NC"}
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No communities found</h3>
                    <p className="text-gray-500">Try adjusting your search terms.</p>
                    <button
                        onClick={() => setQuery('')}
                        className="mt-4 text-brand font-semibold hover:underline"
                    >
                        Clear Search
                    </button>
                </div>
            )}
        </div>
    );
}