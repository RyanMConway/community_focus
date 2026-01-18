import pool from '@/lib/db';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID; // Your Business ID

export interface Review {
    author_name: string;
    rating: number;
    relative_time_description: string;
    text: string;
    profile_photo_url: string;
}

export async function getGoogleReviews(): Promise<Review[]> {
    if (!PLACE_ID || !GOOGLE_PLACES_API_KEY) return [];

    const client = await pool.connect();

    try {
        // 1. Check Cache (valid for 24 hours)
        const cacheRes = await client.query(
            `SELECT reviews_data, updated_at FROM google_reviews_cache 
       WHERE place_id = $1 
       AND updated_at > NOW() - INTERVAL '24 hours'`,
            [PLACE_ID]
        );

        if (cacheRes.rows.length > 0) {
            return cacheRes.rows[0].reviews_data as Review[];
        }

        // 2. Cache Miss: Fetch from Google
        // We use the "New" Places API (Text Search or Details)
        const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews&key=${GOOGLE_PLACES_API_KEY}`;

        const response = await fetch(googleUrl);
        const data = await response.json();

        if (!data.result || !data.result.reviews) {
            console.error("Google API Error:", data);
            return [];
        }

        const cleanReviews: Review[] = data.result.reviews.map((r: any) => ({
            author_name: r.author_name,
            rating: r.rating,
            relative_time_description: r.relative_time_description,
            text: r.text,
            profile_photo_url: r.profile_photo_url
        }));

        // 3. Update Cache
        await client.query(
            `INSERT INTO google_reviews_cache (place_id, reviews_data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (place_id) 
       DO UPDATE SET reviews_data = $2, updated_at = NOW()`,
            [PLACE_ID, JSON.stringify(cleanReviews)]
        );

        return cleanReviews;

    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        return [];
    } finally {
        client.release();
    }
}