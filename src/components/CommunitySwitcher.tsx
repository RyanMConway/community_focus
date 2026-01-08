"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ArrowRight } from 'lucide-react';

interface Community {
    id: number;
    name: string;
    portal_url: string;
    slug: string;
}

export default function CommunitySwitcher() {
    const router = useRouter();
    const [communities, setCommunities] = useState<Community[]>([]);
    const [selectedSlug, setSelectedSlug] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/communities');
                const data = await res.json();
                setCommunities(data);
            } catch (error) {
                console.error('Failed to load communities', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleGo = () => {
        if (selectedSlug) {
            router.push(`/communities/${selectedSlug}`);
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl border border-gray-100 max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <Building2 className="text-brand w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                    Resident Access
                </h3>
            </div>

            <p className="text-sm text-gray-500 mb-6 text-center leading-relaxed">
                Select your community below to view details, pay assessments, and find documents.
            </p>

            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="h-12 bg-gray-50 rounded animate-pulse w-full"></div>
                ) : (
                    <div className="relative">
                        <select
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none bg-gray-50 text-gray-700 appearance-none transition-shadow cursor-pointer font-medium"
                            onChange={(e) => setSelectedSlug(e.target.value)}
                            defaultValue=""
                        >
                            <option value="" disabled>Select your neighborhood...</option>
                            {communities.map((c) => (
                                <option key={c.id} value={c.slug}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* FIX: Changed 'bg-brand-DEFAULT' to 'bg-brand' below */}
                <button
                    onClick={handleGo}
                    disabled={!selectedSlug}
                    className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                    <span>View Community</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}