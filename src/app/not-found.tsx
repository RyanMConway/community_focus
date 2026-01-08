import Link from 'next/link';
import { MapPinOff, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="text-center max-w-lg mx-auto">
                <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPinOff className="w-10 h-10 text-brand" />
                </div>

                <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">
                    Lost in the Neighborhood?
                </h1>

                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                    We couldn't find the page you were looking for. It might have been moved, deleted, or the address was typed incorrectly.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold py-3 px-8 rounded-full transition-all shadow-glow hover:shadow-lg hover:-translate-y-0.5"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}