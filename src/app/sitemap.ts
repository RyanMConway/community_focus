import type { MetadataRoute } from 'next';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getCommunitySlugList(): Promise<string[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT slug FROM communities WHERE slug != 'global' ORDER BY name ASC"
    );
    return res.rows.map((r: { slug: string }) => r.slug);
  } finally {
    client.release();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getCommunitySlugList();
  const base = 'https://www.communityfocusnc.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/communities`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/reviews`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/vendors`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: `${base}/resources`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/get-proposal`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ];

  const communityRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${base}/communities/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...communityRoutes];
}
