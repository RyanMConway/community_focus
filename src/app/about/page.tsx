import { CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-hero-gradient text-white pt-40 pb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">About Us</h1>
                    <p className="text-blue-100 text-lg md:text-xl font-light max-w-2xl mx-auto">
                        Dedicated to protecting the value of your community through professional, transparent, and proactive management.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-lg text-slate-600 mb-16">
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">Who We Are</h3>
                        <p className="mb-6 leading-relaxed">
                            Community Focus of NC, Inc. is a full-service community and commercial association management company.
                            We understand that every neighborhood is different. That is why we don't offer cookie-cutter solutions.
                            Instead, we tailor our services to the individualized needs of our clients.
                        </p>
                        <p className="leading-relaxed">
                            Our goal is simple: to bring your association into focus. By handling the day-to-day operations, financial reporting,
                            and vendor management, we allow Board Members to focus on the big picture—making their community a better place to live.
                        </p>
                    </div>

                    {/* Values Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-card transition-all">
                            <CheckCircle2 className="w-8 h-8 text-brand-DEFAULT mb-4" />
                            <h4 className="text-xl font-bold text-slate-900 mb-2">Local Expertise</h4>
                            <p className="text-slate-600 leading-relaxed">
                                We are based in Durham and serve the surrounding NC areas. We know the local vendors, laws, and market conditions better than national chains.
                            </p>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-card transition-all">
                            <CheckCircle2 className="w-8 h-8 text-brand-DEFAULT mb-4" />
                            <h4 className="text-xl font-bold text-slate-900 mb-2">Transparency</h4>
                            <p className="text-slate-600 leading-relaxed">
                                We believe in an open-book policy. Board members have full visibility into financials and management activities at all times.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}