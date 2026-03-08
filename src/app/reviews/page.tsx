import type { Metadata } from 'next';
import Link from 'next/link';
import { Star, MessageSquarePlus, ArrowLeft } from 'lucide-react';
import { getGoogleReviews } from '@/lib/google-reviews';
import Reveal, { RevealItem } from "@/components/Reveal";
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = {
  title: 'Reviews',
  description:
    'See what board members and homeowners say about Community Focus of NC. Rated 5 stars on Google by the communities we serve.',
};

export const revalidate = 3600;

export default async function ReviewsPage() {
    const reviews = await getGoogleReviews();
    const placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;
    const writeReviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;

    const avgRating = reviews.length
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : 5;

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            <PageHeader
                eyebrow="Community Voices"
                title="Share Your Experience"
                subtitle="Our business thrives because of the strong relationships we've built within our communities. Your feedback helps us continue to provide top-tier service."
            >
                {/* Aggregate star rating chip */}
                <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-brand-gold text-brand-gold" />
                            ))}
                        </div>
                        <span className="text-white font-bold text-xl">{avgRating}</span>
                        <span className="text-blue-200 text-sm">· {reviews.length} Google Reviews</span>
                    </div>

                    <a
                        href={writeReviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-brand-gold hover:bg-amber-400 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg hover:-translate-y-0.5"
                    >
                        <MessageSquarePlus className="w-4 h-4" />
                        Leave a Google Review
                    </a>
                </div>
            </PageHeader>

            <div className="container mx-auto px-4 pt-8">

                {/* Reviews Grid */}
                <Reveal width="100%" stagger>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reviews.map((review, i) => (
                            <RevealItem key={i}>
                                <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col hover:shadow-card-hover hover:border-brand/20 transition-all duration-300 relative overflow-hidden">
                                    {/* Decorative quote mark */}
                                    <div className="absolute top-4 right-6 text-8xl font-serif text-brand/5 leading-none select-none pointer-events-none">
                                        &ldquo;
                                    </div>

                                    {/* Gradient top bar on hover */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-brand-accent to-brand-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <div className="flex items-center gap-4 mb-6 relative z-10">
                                        {review.profile_photo_url && (
                                            <img
                                                src={review.profile_photo_url}
                                                alt={review.author_name}
                                                className="w-12 h-12 rounded-full border-2 border-slate-100 shadow-sm"
                                                referrerPolicy="no-referrer"
                                            />
                                        )}
                                        <div>
                                            <div className="font-bold text-slate-900">{review.author_name}</div>
                                            <div className="flex text-brand-gold text-sm mt-0.5">
                                                {[...Array(5)].map((_, starI) => (
                                                    <Star
                                                        key={starI}
                                                        className={`w-4 h-4 ${starI < review.rating ? 'fill-current' : 'text-slate-200 fill-slate-200'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-slate-600 italic text-[15px] flex-grow leading-relaxed relative z-10">
                                        &ldquo;{review.text}&rdquo;
                                    </p>

                                    <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 font-medium uppercase tracking-wider relative z-10">
                                        {review.relative_time_description}
                                    </div>
                                </div>
                            </RevealItem>
                        ))}
                    </div>
                </Reveal>

                {reviews.length === 0 && (
                    <div className="text-center text-slate-400 py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                        <p>Unable to load reviews at this time, or no reviews found.</p>
                    </div>
                )}

                {/* Back link */}
                <div className="flex justify-center mt-16">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-brand font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
