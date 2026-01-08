"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
    {
        question: "How do I pay my association dues?",
        answer: "We offer several convenient ways to pay. You can pay online via our Resident Portal using a credit card or e-check. You can also set up auto-draft (ACH) to ensure you never miss a payment, or mail a physical check to our lockbox address listed on your statement."
    },
    {
        question: "How do I report a maintenance issue?",
        answer: "The fastest way is to log in to the Resident Portal and submit a 'Work Order.' This allows you to track the status of your request in real-time. Alternatively, you can email our support team directly at info@communityfocusnc.com."
    },
    {
        question: "I am selling my home. How do I order resale documents?",
        answer: "We partner with HomeWiseDocs to provide resale packages, lender questionnaires, and closing statements. Please visit HomeWiseDocs.com to place your order. Expedited processing is available if needed."
    },
    {
        question: "How do I submit an architectural request?",
        answer: "Most changes to the exterior of your home (fences, paint, additions) require Board approval. You can download the ARC Request Form from your community's portal page. Please submit the completed form along with any required surveys or paint samples."
    }
];

export default function FAQ() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
                <div key={index} className="mb-4">
                    <button
                        onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                        className={`w-full flex items-center justify-between p-6 text-left bg-white border transition-all duration-300 rounded-2xl ${
                            activeIndex === index
                                ? 'border-brand shadow-md ring-1 ring-brand'
                                : 'border-slate-100 hover:border-brand-accent/50'
                        }`}
                    >
            <span className={`font-bold text-lg ${activeIndex === index ? 'text-brand-dark' : 'text-slate-700'}`}>
              {faq.question}
            </span>
                        <div className={`p-2 rounded-full transition-colors ${activeIndex === index ? 'bg-brand text-white' : 'bg-slate-50 text-slate-400'}`}>
                            {activeIndex === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </div>
                    </button>

                    <AnimatePresence>
                        {activeIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 pt-0 text-slate-600 leading-relaxed border-l-2 border-brand ml-6 my-2">
                                    {faq.answer}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}