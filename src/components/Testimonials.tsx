"use client";

import { Quote, Star } from 'lucide-react';

interface Review {
    author_name: string;
    rating: number;
    text: string;
    relative_time_description: string;
}

export default function Testimonials({ reviews }: { reviews: Review[] }) {
    // Fallback if no reviews are passed (or API fails)
    const displayReviews = reviews.length > 0 ? reviews : [
        { text: "Community Focus turned our HOA around. Our financials are finally clear.", author_name: "Sarah J.", rating: 5, relative_time_description: "Board President" },
        { text: "I love that I can actually reach someone when I call.", author_name: "Mike T.", rating: 5, relative_time_description: "Homeowner" },
        { text: "Professional, transparent, and always available.", author_name: "James L.", rating: 5, relative_time_description: "Secretary" },
    ];

    return (
        <div className="relative w-full overflow-hidden mask-linear-fade">
            <div className="flex gap-8 animate-infinite-scroll w-max py-4">
                {/* Duplicate list for seamless loop */}
                {[...displayReviews, ...displayReviews].map((t, i) => (
                    <div key={i} className="w-[350px] md:w-[450px] bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="bg-brand/10 p-3 rounded-xl text-brand">
                                <Quote className="w-5 h-5 fill-current" />
                            </div>
                            <div className="w-full">
                                <p className="text-slate-600 mb-4 leading-relaxed italic text-[15px] line-clamp-4">
                                    "{t.text}"
                                </p>
                                <div className="flex justify-between items-end border-t border-slate-50 pt-3">
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm truncate max-w-[150px]">{t.author_name}</p>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t.relative_time_description}</p>
                                    </div>
                                    <div className="flex text-yellow-400 gap-0.5">
                                        {[...Array(5)].map((_, starI) => (
                                            <Star key={starI} className={`w-3.5 h-3.5 ${starI < t.rating ? 'fill-current' : 'text-slate-200'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Fade edges */}
            <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>
        </div>
    );
}