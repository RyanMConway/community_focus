import CommunitySwitcher from "@/components/CommunitySwitcher";
import Reveal from "@/components/Reveal";
import ShinyButton from "@/components/ShinyButton";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ"; // <--- Import FAQ
import { Shield, Hammer, Users } from 'lucide-react';

export default function Home() {
  return (
      <main className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <div className="relative pt-40 pb-32 lg:pt-56 lg:pb-48 overflow-hidden bg-hero-gradient">

          {/* Background Shapes */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 container mx-auto px-4 text-center text-white flex flex-col items-center">

            {/* Wrap elements in Reveal to animate them */}
            <Reveal>
              <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-6 backdrop-blur-sm">
                Trusted by 30+ Communities in NC
              </span>
            </Reveal>

            <Reveal delay={0.1}>
              {/* Gradient Text H1 */}
              <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight drop-shadow-sm text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white">
                Community Focus
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                Professional association management focused on transparency, communication, and community well-being.
              </p>
            </Reveal>

            {/* Shiny Button */}
            <Reveal delay={0.3}>
              <ShinyButton href="/contact" className="mt-4">
                Get a Proposal
              </ShinyButton>
            </Reveal>

          </div>
        </div>

        {/* The Switcher - Floating */}
        <div className="container mx-auto px-4 -mt-24 relative z-20">
          <Reveal width="100%" delay={0.4}>
            <CommunitySwitcher />
          </Reveal>

          {/* Modern Features Grid */}
          <div className="mt-24 mb-20">
            <div className="text-center mb-16">
              <Reveal width="100%">
                <div className="flex flex-col items-center">
                  <h2 className="text-3xl font-bold text-slate-800">Why Boards Choose Us</h2>
                  <div className="w-16 h-1 bg-brand mt-4 rounded-full"></div>
                </div>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {/* Feature 1 */}
              <Reveal delay={0.1}>
                <div className="group p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-card hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-white transition-colors">
                    <Shield className="w-6 h-6 text-brand group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Financial Security</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Secure assessment collection and transparent reporting that gives boards peace of mind.
                  </p>
                </div>
              </Reveal>

              {/* Feature 2 */}
              <Reveal delay={0.2}>
                <div className="group p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-card hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-white transition-colors">
                    <Hammer className="w-6 h-6 text-brand group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Property Maintenance</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Regular site inspections and trusted vendor coordination to protect property values.
                  </p>
                </div>
              </Reveal>

              {/* Feature 3 */}
              <Reveal delay={0.3}>
                <div className="group p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-card hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-white transition-colors">
                    <Users className="w-6 h-6 text-brand group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Community Support</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Dedicated support for boards and homeowners, ensuring communication is never an issue.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>

          {/* TESTIMONIALS SECTION */}
          <div className="mb-24">
            <div className="text-center mb-12">
              <Reveal>
                <h2 className="text-3xl font-bold text-slate-800">What Our Communities Say</h2>
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <Testimonials />
            </Reveal>
          </div>

          {/* FAQ SECTION (Added Here) */}
          <div className="mb-24">
            <div className="text-center mb-12">
              <Reveal>
                <h2 className="text-3xl font-bold text-slate-800 mb-4">Common Questions</h2>
                <div className="w-16 h-1 bg-brand mx-auto rounded-full"></div>
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <FAQ />
            </Reveal>
          </div>

        </div>
      </main>
  );
}