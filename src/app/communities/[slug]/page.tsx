import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, ArrowLeft, MapPin, Info } from 'lucide-react';
import pool from '@/lib/db';

// This function fetches the specific community based on the URL
async function getCommunity(slug: string) {
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            'SELECT * FROM communities WHERE slug = $1',
            [slug]
        );
        return rows[0];
    } finally {
        client.release();
    }
}

export default async function CommunityPage({ params }: { params: { slug: string } }) {
    // Await the params object (Required in Next.js 15+, good practice generally)
    const { slug } = await params;
    const community = await getCommunity(slug);

    // If slug doesn't exist in DB, show 404
    if (!community) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Header with Background Image */}
            <div className="relative h-64 md:h-80 bg-brand-dark">
                <div className="absolute inset-0 bg-black/50 z-10"></div>
                {/* You can make this image dynamic later using community.photo_url */}
                <div className="absolute inset-0 z-0 bg-brand-dark">
                    {/* If you have a real image, use Next/Image here */}
                </div>

                <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-end pb-8 text-white">
                    <Link href="/" className="inline-flex items-center text-blue-200 hover:text-white mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl font-serif font-bold">{community.name}</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Main Content (Left 2 Columns) */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Info className="w-6 h-6 text-brand" />
                                About the Community
                            </h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                {community.description || "Welcome to our community. We are proud to be managed by Community Focus of NC."}
                            </p>
                        </div>

                        {/* Placeholder for future features (e.g., Public Documents) */}
                        <div className="bg-blue-50 p-8 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-brand-dark mb-2">Need Help?</h3>
                            <p className="text-gray-600 mb-4">
                                If you are a resident and need assistance with maintenance or billing, please contact our support team.
                            </p>
                            <Link href="/contact" className="text-brand font-semibold hover:underline">
                                Contact Support &rarr;
                            </Link>
                        </div>
                    </div>

                    {/* Sidebar (Right Column) - The Action Center */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-brand sticky top-24">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Resident Portal</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Log in to pay dues, submit work orders, and view governing documents.
                            </p>

                            <a
                                href={community.portal_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-brand-dark hover:bg-brand text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md mb-4"
                            >
                                <span>Go to Portal</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>

                            <div className="text-xs text-center text-gray-400">
                                You will be redirected to CINC WebAxis
                            </div>
                        </div>

                        {/* Location / Map Placeholder */}
                        <div className="mt-8 bg-gray-100 p-6 rounded-xl text-center">
                            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 font-medium">{community.city || "Durham, NC"}</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}