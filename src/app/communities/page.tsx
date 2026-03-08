import type { Metadata } from 'next';
import pool from '@/lib/db';
import CommunityList from '@/components/CommunityList';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = {
  title: 'Our Communities',
  description:
    'Browse all 30+ HOA communities managed by Community Focus of NC across Durham, Chapel Hill, Hillsborough, Carrboro, and Pittsboro.',
};

async function getCommunities() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT * FROM communities WHERE slug != 'global' ORDER BY name ASC");
        return res.rows;
    } finally {
        client.release();
    }
}

export default async function CommunitiesPage() {
    const communities = await getCommunities();

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            <PageHeader
                eyebrow="Our Portfolio"
                title="Our Communities"
                subtitle="Community Focus of NC is proud to manage these distinctive neighborhoods across the Triangle area of North Carolina."
                badge={`${communities.length} Communities Managed`}
            />

            <div className="max-w-7xl mx-auto px-6 py-16">
                <CommunityList communities={communities} />
            </div>
        </main>
    );
}