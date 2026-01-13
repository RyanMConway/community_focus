"use client";

import { Quote } from 'lucide-react';

const testimonials = [
    { quote: "Community Focus turned our HOA around. Our financials are finally clear, and our property values are up.", author: "Sarah J.", role: "Board President, Durham" },
    { quote: "I love that I can actually reach someone when I call. The personal service makes a huge difference.", author: "Mike T.", role: "Homeowner, Chapel Hill" },
    { quote: "Their vendor connections saved us thousands on our paving project. Highly recommended.", author: "David R.", role: "Treasurer, Raleigh" },
    { quote: "Professional, transparent, and always available. The best management company we've worked with.", author: "James L.", role: "HOA Secretary, Apex" },
    { quote: "Finally, a portal that actually works! Paying dues is so simple now.", author: "Emily W.", role: "Homeowner, Cary" }
];

export default function Testimonials() {
    return (
        <div className="relative w-full overflow-hidden mask-linear-fade">
            {/* We need to duplicate the list to create a seamless loop.
               We wrap them in a container that animates.
            */}
            <div className="flex gap-8 animate-infinite-scroll w-max py-4">
                {[...testimonials, ...testimonials].map((t, i) => (
                    <div key={i} className="w-[350px] md:w-[450px] bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="bg-brand/10 p-3 rounded-xl text-brand">
                                <Quote className="w-5 h-5 fill-current" />
                            </div>
                            <div>
                                <p className="text-slate-600 mb-4 leading-relaxed italic text-[15px]">"{t.quote}"</p>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{t.author}</p>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Fade edges for smooth look */}
            <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>
        </div>
    );
}