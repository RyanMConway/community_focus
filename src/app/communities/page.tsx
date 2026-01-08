import pool from '@/lib/db';
import CommunitySearchGrid from '@/components/CommunitySearchGrid';

async function getCommunities() {
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            'SELECT * FROM communities WHERE is_active = true ORDER BY name ASC'
        );
        return rows;
    } finally {
        client.release();
    }
}

export default async function CommunitiesIndexPage() {
    const communities = await getCommunities();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header - Spacing Fixed */}
            <div className="bg-hero-gradient text-white pt-40 pb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Communities</h1>
                    <p className="text-blue-100 text-lg md:text-xl font-light max-w-2xl mx-auto">
                        We are proud to manage these wonderful neighborhoods across North Carolina.
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 py-16 -mt-10 relative z-20">
                <CommunitySearchGrid communities={communities} />
            </div>
        </div>
    );
}