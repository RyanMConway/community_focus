import pool from '@/lib/db';
import CommunityList from '@/components/CommunityList';

async function getCommunities() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM communities ORDER BY name ASC');
        return res.rows;
    } finally {
        client.release();
    }
}

export default async function CommunitiesPage() {
    const communities = await getCommunities();

    return (
        <main className="min-h-screen bg-slate-50 pb-20"> {/* REMOVED pt-24 */}

            {/* HEADER: Added pt-32 */}
            <div className="bg-brand-dark text-white pt-32 pb-16 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl font-serif font-bold mb-4">Our Communities</h1>
                    <p className="text-brand-accent text-lg max-w-2xl mx-auto">
                        Community Focus of NC is proud to manage these distinctive neighborhoods across the Triangle.
                    </p>
                </div>
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <CommunityList communities={communities} />
            </div>
        </main>
    );
}