import pool from '@/lib/db';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;

export interface Review {
    author_name: string;
    rating: number;
    relative_time_description: string;
    text: string;
    profile_photo_url: string;
}

export async function getGoogleReviews(): Promise<Review[]> {
    // DEBUG: Check if keys are loaded
    if (!PLACE_ID || !GOOGLE_PLACES_API_KEY) {
        console.error("❌ MISSING KEYS: Check .env.local file.");
        console.error("   - PLACE_ID:", PLACE_ID ? "Found" : "Missing");
        console.error("   - API_KEY:", GOOGLE_PLACES_API_KEY ? "Found" : "Missing");
        return [];
    }

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
            console.log("✅ Serving reviews from Cache (Neon DB)");
            return cacheRes.rows[0].reviews_data as Review[];
        }

        console.log("🔄 Cache Miss or Expired. Fetching from Google...");

        // 2. Cache Miss: Fetch from Google
        const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews&key=${GOOGLE_PLACES_API_KEY}`;

        const response = await fetch(googleUrl);
        const data = await response.json();

        // DEBUG: Check Google Response
        if (data.status !== 'OK') {
            console.error("❌ GOOGLE API ERROR:", data.status, data.error_message);
            return [];
        }

        if (!data.result || !data.result.reviews) {
            console.warn("⚠️ Google API returned OK, but no reviews found in result.");
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

        console.log(`✅ Fetched ${cleanReviews.length} reviews from Google and updated cache.`);
        return cleanReviews;

    } catch (error) {
        console.error("❌ SYSTEM ERROR in getGoogleReviews:", error);
        return [];
    } finally {
        client.release();
    }
}