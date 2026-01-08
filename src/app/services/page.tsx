import {
    Briefcase,
    Calculator,
    Monitor,
    Warehouse,
    ClipboardCheck,
    PlusCircle
} from 'lucide-react';

export default function ServicesPage() {
    const services = [
        {
            title: "Administrative Services",
            description: "Effective management requires proactive leadership. We work directly with your Board and Committees to ensure your property is maintained to the highest standards. Our team handles the day-to-day operational duties unique to your HOA, COA, or POA, enforcing governing documents with consistency and fairness.",
            icon: <Briefcase className="w-8 h-8 text-brand-DEFAULT" />,
        },
        {
            title: "Financial Transparency",
            description: "We maintain an absolute open-book policy. Our team produces clear, concise financial reports so every board member understands exactly how community funds are being utilized. We also consult with local accountants to review financials, ensuring your community makes the best use of its capital reserves.",
            icon: <Calculator className="w-8 h-8 text-brand-DEFAULT" />,
        },
        {
            title: "Web & Communication",
            description: "Modern communication is key to a happy community. We provide a secure, specific web portal for your association that allows homeowners to make payments by credit card or e-check instantly. We prioritize email communication to ensure immediate responses to homeowners, board members, and vendors.",
            icon: <Monitor className="w-8 h-8 text-brand-DEFAULT" />,
        },
        {
            title: "Facility Management",
            description: "With over 15 years of experience managing pools, tennis courts, and clubhouses, we know how to protect your assets. We supervise the operations of your recreational facilities to ensure quality programs and services are maintained, promoting the long-term value and wellness of your neighborhood.",
            icon: <Warehouse className="w-8 h-8 text-brand-DEFAULT" />,
        },
        {
            title: "Project Management",
            description: "From minor repairs to major renovations, we oversee construction projects from start to finish. We keep the Board of Directors informed at every stage, ensuring vendors perform to contract specifications. We assist associations in developing long-term capital plans to preserve property values.",
            icon: <ClipboardCheck className="w-8 h-8 text-brand-DEFAULT" />,
        },
        {
            title: "Custom Solutions",
            description: "Every community is unique. In addition to our core services, we are flexible and willing to broaden our scope to meet your specific needs. Whether you need specialized consulting or unique on-site services, Community Focus is ready to help bring your association into focus.",
            icon: <PlusCircle className="w-8 h-8 text-brand-DEFAULT" />,
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Page Header - Updated with Padding and Gradient */}
            <div className="bg-hero-gradient text-white pt-40 pb-20 relative overflow-hidden">
                {/* Background blobs for premium feel */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl"></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 drop-shadow-sm">Our Services</h1>
                    <p className="text-blue-100 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed font-light">
                        Innovative Association Management. We offer tailored solutions to protect your property values and build a stronger community.
                    </p>
                </div>
            </div>

            {/* Services Grid */}
            <div className="container mx-auto px-4 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 md:p-10 rounded-2xl shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col items-start h-full group"
                        >
                            <div className="bg-blue-50 p-4 rounded-xl mb-6 group-hover:bg-brand-DEFAULT group-hover:text-white transition-colors">
                                {/* Clone the icon to apply hover styles if needed, or rely on CSS */}
                                <div className="text-brand-DEFAULT group-hover:text-white transition-colors">
                                    {service.icon}
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4">
                                {service.title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="container mx-auto px-4 pb-24">
                <div className="bg-brand-DEFAULT text-white rounded-3xl p-12 text-center shadow-glow relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-serif font-bold mb-4">Bring Your Association Into Focus</h2>
                        <p className="mb-8 text-blue-50 text-lg max-w-2xl mx-auto">
                            Ready to upgrade your management experience? Request a proposal today.
                        </p>
                        <a
                            href="/contact"
                            className="inline-block bg-white text-brand-dark font-bold py-4 px-10 rounded-full hover:bg-slate-50 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            Contact Us Today
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}