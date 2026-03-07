import Link from 'next/link';
import { Shield, Hammer, Users, MapPin, ArrowRight } from 'lucide-react';
import Reveal, { RevealItem } from "@/components/Reveal";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import StatsBar from "@/components/StatsBar";
import HeroSection from "@/components/HeroSection";
import pool from '@/lib/db';
import { getGoogleReviews } from '@/lib/google-reviews';

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

        <HeroSection />

        {/* COMMUNITIES GRID */}
        <div className="container mx-auto px-4 -mt-16 relative z-20">
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
                  <span className="text-brand-gold font-bold tracking-wider uppercase text-xs mb-3">Why Choose Us</span>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold">
                    <span className="text-gradient">Built for Modern Boards</span>
                  </h2>
                </div>
              </Reveal>
            </div>

            <Reveal width="100%" stagger>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {[
                  { icon: Shield, title: "Financial Integrity", desc: "Bank-grade security for assessments, transparent real-time reporting, and rigorous audit trails." },
                  { icon: Hammer, title: "Proactive Maintenance", desc: "We don't just fix problems; we prevent them with regular site inspections and trusted vendor networks." },
                  { icon: Users, title: "Community First", desc: "Dedicated managers who actually answer the phone and care about the neighbors they serve." }
                ].map((feature, idx) => (
                  <RevealItem key={idx}>
                    <div className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-card-hover hover:border-brand/20 transition-all duration-300 h-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-brand-accent to-brand-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <feature.icon className="w-7 h-7 text-brand" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                      <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
                    </div>
                  </RevealItem>
                ))}
              </div>
            </Reveal>
          </div>

        </div>

        {/* STATS BAR — full bleed, outside container */}
        <StatsBar />

        <div className="container mx-auto px-4">

          {/* TESTIMONIALS SECTION */}
          <div className="mb-24 py-20 -mx-4 bg-slate-100/50 border-y border-slate-200/60 mt-24">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <Reveal>
                  <h2 className="text-3xl font-serif font-bold">
                    <span className="text-gradient">Community Voices</span>
                  </h2>
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
                <h2 className="text-3xl font-serif font-bold mb-4">
                  <span className="text-gradient">Frequently Asked Questions</span>
                </h2>
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