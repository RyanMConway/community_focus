import Link from 'next/link';
import { Shield, Hammer, Users, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import Reveal from "@/components/Reveal";
import ShinyButton from "@/components/ShinyButton";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import pool from '@/lib/db';
import { getGoogleReviews } from '@/lib/google-reviews';
import HomeQuestionnaire from "@/components/HomeQuestionnaire"; // IMPORT ADDED

async function getFeaturedCommunities() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM communities ORDER BY name ASC LIMIT 6');
    return res.rows;
  } finally {
    client.release();
  }
}

export default async function Home() {
  const communities = await getFeaturedCommunities();
  const reviews = await getGoogleReviews();

  return (
      <main className="min-h-screen bg-slate-50 selection:bg-brand selection:text-white">

        {/* HERO SECTION */}
        <div className="relative pt-40 pb-40 lg:pt-48 lg:pb-48 overflow-hidden bg-hero-gradient">

          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none"></div>

          {/* Animated Background Shapes (Refined) */}
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-brand-accent/30 rounded-full blur-[100px] animate-float pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-float-delayed pointer-events-none"></div>

          <div className="relative z-10 container mx-auto px-4 text-center text-white flex flex-col items-center">

            <Reveal>
              <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-8 backdrop-blur-md shadow-lg shadow-black/5 hover:bg-white/20 transition-colors cursor-default">
                <CheckCircle2 className="w-4 h-4 text-brand-accent" />
                <span className="text-blue-50">Trusted by 30+ NC Communities</span>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 tracking-tight drop-shadow-sm">
                Focus on your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200">
                  Community.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-lg md:text-xl text-blue-100/90 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                We handle the heavy lifting of association management with transparency,
                modern technology, and a personal touch.
              </p>
            </Reveal>

            {/* REPLACED BUTTONS WITH NEW QUESTIONNAIRE COMPONENT */}
            <Reveal delay={0.3} width="100%">
              <HomeQuestionnaire />
            </Reveal>

          </div>

          {/* Decorative Bottom Wave/Fade */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50 to-transparent"></div>
        </div>

        {/* COMMUNITIES GRID - Floating Card Effect */}
        <div className="container mx-auto px-4 -mt-16 relative z-20"> {/* Adjusted margin-top slightly */}
          <Reveal width="100%">
            <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/50 text-center mb-24">
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Find Your Community</h3>
              <p className="text-slate-500 mb-8 max-w-xl mx-auto">Access your homeowner portal, view documents, and stay up to date with the latest neighborhood news.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                {communities.map((comm) => (
                    <Link
                        key={comm.id}
                        href={`/communities/${comm.slug}`}
                        className="flex items-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-glow hover:border-brand/30 hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <div className="bg-blue-50 p-2.5 rounded-lg mr-4 group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                        <MapPin className="w-5 h-5 text-brand group-hover:text-white" />
                      </div>
                      <span className="font-semibold text-slate-700 group-hover:text-brand transition-colors truncate">{comm.name}</span>
                    </Link>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100/60">
                <Link href="/communities" className="inline-flex items-center font-bold text-brand hover:text-brand-dark transition-colors hover:underline decoration-2 underline-offset-4">
                  View All Communities <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* FEATURES GRID */}
          <div className="mb-32">
            <div className="text-center mb-16">
              <Reveal width="100%">
                <div className="flex flex-col items-center">
                  <span className="text-brand font-bold tracking-wider uppercase text-xs mb-2">Why Choose Us</span>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Built for Modern Boards</h2>
                </div>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[
                { icon: Shield, title: "Financial Integrity", desc: "Bank-grade security for assessments, transparent real-time reporting, and rigorous audit trails." },
                { icon: Hammer, title: "Proactive Maintenance", desc: "We don't just fix problems; we prevent them with regular site inspections and trusted vendor networks." },
                { icon: Users, title: "Community First", desc: "Dedicated managers who actually answer the phone and care about the neighbors they serve." }
              ].map((feature, idx) => (
                  <Reveal key={idx} delay={0.1 * (idx + 1)}>
                    <div className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-card-hover hover:border-brand/20 transition-all duration-300 h-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-brand-accent to-brand opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <feature.icon className="w-7 h-7 text-brand" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                      <p className="text-slate-600 leading-relaxed text-sm">
                        {feature.desc}
                      </p>
                    </div>
                  </Reveal>
              ))}
            </div>
          </div>

          {/* TESTIMONIALS SECTION */}
          <div className="mb-24 py-20 -mx-4 bg-slate-100/50 border-y border-slate-200/60">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <Reveal>
                  <h2 className="text-3xl font-serif font-bold text-slate-900">Community Voices</h2>
                  <p className="text-slate-500 mt-2">Hear from the board members we work with every day.</p>
                </Reveal>
              </div>

              {/* Reviews Slider */}
              <Reveal delay={0.2}>
                <Testimonials reviews={reviews} />
              </Reveal>

              {/* See All Reviews Button */}
              <Reveal delay={0.3}>
                <div className="flex justify-center mt-12">
                  <Link
                      href="/reviews"
                      className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold hover:border-brand hover:text-brand transition-all shadow-sm hover:shadow-md"
                  >
                    See All Reviews
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </Reveal>

            </div>
          </div>

          {/* FAQ SECTION */}
          <div className="mb-24 container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <Reveal>
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <FAQ />
              </div>
            </Reveal>
          </div>

        </div>
      </main>
  );
}