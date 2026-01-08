import pool from '@/lib/db';
import CommunitySearchGrid from '@/components/CommunitySearchGrid';

// Fetch all active communities for the list
async function getCommunities() {
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            'SELECT id, name, slug, city FROM communities WHERE is_active = true ORDER BY name ASC'
        );
        return rows;
    } finally {
        client.release();
    }
}

export default async function CommunitiesPage() {
    const communities = await getCommunities();

    return (
        <main className="min-h-screen bg-slate-50 pt-24 pb-20">
            {/* Header */}
            <div className="bg-brand-dark text-white py-16 px-6 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-serif font-bold mb-4">Our Communities</h1>
                    <p className="text-brand-accent text-lg max-w-2xl mx-auto">
                        Search for your community below to access your resident portal, documents, and news.
                    </p>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* Content Area with Search Grid */}
            {/* UPDATED: Increased z-index to 30 to ensure search bar stays on top */}
            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-30">
                <CommunitySearchGrid communities={communities} />
            </div>
        </main>
    );
}