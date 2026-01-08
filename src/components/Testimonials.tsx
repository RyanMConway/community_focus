import { Quote } from 'lucide-react';

const testimonials = [
    {
        quote: "Since switching to Community Focus, our board meetings have become efficient and our financials are finally transparent. Highly recommend.",
        author: "Sarah J.",
        role: "Board President",
        community: "Brandon Ridge"
    },
    {
        quote: "The response time is incredible. Whenever I have a maintenance issue, it gets addressed within 24 hours. A breath of fresh air.",
        author: "Michael T.",
        role: "Homeowner",
        community: "Five Oaks"
    },
    {
        quote: "They handled our major roofing project seamlessly. They found the vendors, managed the bids, and oversaw the entire construction process.",
        author: "David R.",
        role: "Treasurer",
        community: "Hope Valley"
    }
];

export default function Testimonials() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
                <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 relative group hover:bg-white hover:shadow-card transition-all duration-300">
                    <Quote className="w-10 h-10 text-brand-accent/20 mb-4 group-hover:text-brand-DEFAULT transition-colors" />
                    <p className="text-slate-600 mb-6 leading-relaxed italic">"{t.quote}"</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-dark text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {t.author.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">{t.author}</p>
                            <p className="text-xs text-brand-DEFAULT font-medium">{t.role} • {t.community}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}