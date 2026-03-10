export default function CommunityPageSkeleton() {
    return (
        <main className="min-h-screen bg-slate-50" aria-busy="true" aria-label="Loading community page">
            {/* Alert banner placeholder — mirrors potential AlertBanner height */}
            <div className="h-12 bg-brand-dark/20 animate-pulse" />

            {/* Hero skeleton */}
            <div className="min-h-[280px] md:min-h-[380px] lg:min-h-[450px] bg-brand-dark animate-pulse" />

            {/* Main grid */}
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 -mt-16 relative z-20">

                {/* Left column: Manager card + Portal card */}
                <div className="space-y-8 lg:sticky lg:top-28 lg:self-start">
                    {/* Manager card skeleton */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-white/50">
                        <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-6" />
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-slate-200 rounded-full animate-pulse flex-shrink-0" />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                                <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-3 mt-4">
                            <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                            <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                        </div>
                    </div>

                    {/* Portal card skeleton */}
                    <div className="bg-brand/40 p-6 rounded-2xl animate-pulse h-40" />
                </div>

                {/* Right column: Documents */}
                <div className="lg:col-span-2 space-y-6 lg:mt-24">
                    {/* Section heading skeleton */}
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-1 bg-slate-200 rounded-full animate-pulse" />
                        <div className="h-7 w-52 bg-slate-200 rounded animate-pulse" />
                    </div>

                    {/* Document category card skeletons */}
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            {/* Category header */}
                            <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100">
                                <div className="h-5 w-36 bg-slate-200 rounded animate-pulse" />
                            </div>
                            {/* Document rows */}
                            <div className="divide-y divide-slate-100">
                                {[0, 1, 2].map((j) => (
                                    <div key={j} className="flex items-center justify-between px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
                                            <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
                                        </div>
                                        <div className="h-8 w-8 bg-slate-100 rounded-full animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
