import Link from 'next/link';
import { Star, MessageSquarePlus, ArrowRight } from 'lucide-react';
import { getGoogleReviews } from '@/lib/google-reviews';
import Reveal from "@/components/Reveal";

export const revalidate = 3600; // Revalidate every hour (ISR)

export default async function ReviewsPage() {
    const reviews = await getGoogleReviews();
    const placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;
    const writeReviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;

    return (
        <main className="min-h-screen bg-slate-50 pt-32 pb-20">
            <div className="container mx-auto px-4">

                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <Reveal>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
                            Your Feedback Matters
                        </h1>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            We strive to provide the best community management experience in NC.
                            See what our boards and homeowners are saying, or share your own experience.
                        </p>

                        <a
                            href={writeReviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-1"
                        >
                            <MessageSquarePlus className="w-5 h-5" />
                            Write a Google Review
                        </a>
                    </Reveal>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map((review, i) => (
                        <Reveal key={i} delay={i * 0.1}>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
                                <div className="flex items-center gap-4 mb-4">
                                    <img
                                        src={review.profile_photo_url}
                                        alt={review.author_name}
                                        className="w-12 h-12 rounded-full border border-slate-100"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div>
                                        <div className="font-bold text-slate-900">{review.author_name}</div>
                                        <div className="flex text-yellow-400 text-sm">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-600 italic text-[15px] flex-grow leading-relaxed">
                                    "{review.text}"
                                </p>
                                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 font-medium uppercase tracking-wider">
                                    {review.relative_time_description}
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>

                {reviews.length === 0 && (
                    <div className="text-center text-slate-400 py-12">
                        Unable to load reviews at this time.
                    </div>
                )}

            </div>
        </main>
    );
}