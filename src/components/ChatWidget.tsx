"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Send, User, Building2, ChevronRight, Phone, Mail, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Message = {
    role: 'user' | 'bot';
    text: string;
    managerInfo?: { name: string; email: string; phone: string } | null;
};

const SUGGESTED_QUESTIONS = [
    "What are the parking rules?",
    "How do I submit an architectural request?",
    "What are the pet policies?",
    "How do I pay my HOA dues?",
    "What are the trash and recycling pickup days?",
    "How do I access the resident portal?",
];

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
    const [communities, setCommunities] = useState<{ id: number; name: string; slug: string }[]>([]);
    const [isShimmying, setIsShimmying] = useState(false);

    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', text: "Hello! I'm **Waldo**, your Community Focus AI assistant. Select your community and I'll answer questions about your neighborhood's rules, amenities, and more." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Feedback state
    const [ratedMessages, setRatedMessages] = useState<Set<number>>(new Set());
    const [showSessionFeedback, setShowSessionFeedback] = useState(false);
    const [sessionFeedbackDone, setSessionFeedbackDone] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    // Shimmy every 30 seconds when closed
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isOpen) {
                setIsShimmying(true);
                setTimeout(() => setIsShimmying(false), 800);
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [isOpen]);

    // Fetch communities when widget opens
    useEffect(() => {
        if (isOpen && communities.length === 0) {
            fetch('/api/communities')
                .then(res => res.json())
                .then(data => setCommunities(data))
                .catch(err => console.error("Failed to load communities", err));
        }
    }, [isOpen, communities.length]);

    const submitFeedback = async (
        rating: 1 | -1,
        feedbackType: 'escalation' | 'session',
        question?: string,
        waldoAnswer?: string
    ) => {
        if (!selectedCommunity) return;
        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    communitySlug: selectedCommunity,
                    question: question ?? null,
                    waldoAnswer: waldoAnswer ?? null,
                    rating,
                    feedbackType,
                }),
            });
        } catch (e) {
            console.error('Failed to submit feedback', e);
        }
    };

    const handleEscalationFeedback = (msgIdx: number, rating: 1 | -1) => {
        setRatedMessages(prev => new Set(prev).add(msgIdx));
        // Find the user message that preceded this bot message
        const userMsg = messages[msgIdx - 1];
        const botMsg = messages[msgIdx];
        submitFeedback(rating, 'escalation', userMsg?.text, botMsg.text);
    };

    const handleClose = () => {
        const hasChatted = messages.length > 1;
        if (hasChatted && !showSessionFeedback && !sessionFeedbackDone) {
            setShowSessionFeedback(true);
            return;
        }
        setIsOpen(false);
        setShowSessionFeedback(false);
    };

    const handleSessionFeedback = (rating: 1 | -1) => {
        submitFeedback(rating, 'session');
        setSessionFeedbackDone(true);
        setShowSessionFeedback(false);
        setIsOpen(false);
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || !selectedCommunity) return;

        const activeComm = communities.find(c => c.slug === selectedCommunity);
        const communityName = activeComm?.name ?? selectedCommunity;

        setMessages(prev => [...prev, { role: 'user', text }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: messages,
                    communityName,
                    communitySlug: selectedCommunity,
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setMessages(prev => [...prev, {
                role: 'bot',
                text: data.reply,
                managerInfo: data.managerInfo ?? null,
            }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                role: 'bot',
                text: "I'm having trouble connecting right now. Please try again in a moment."
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const activeCommunityName = communities.find(c => c.slug === selectedCommunity)?.name;
    const hasChatted = messages.length > 1;

    return (
        <>
            {/* Floating Toggle Button */}
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4">
                <AnimatePresence>
                    {isShimmying && !isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="bg-white text-slate-800 px-4 py-2 rounded-xl shadow-lg border border-slate-100 text-sm font-semibold hidden md:block"
                        >
                            Need help? Ask Waldo!
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => isOpen ? handleClose() : setIsOpen(true)}
                    className={`
                        p-4 rounded-full shadow-2xl transition-all duration-300 relative group
                        ${isOpen ? 'bg-white text-slate-800 rotate-90' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'}
                        ${isShimmying ? 'animate-shimmy' : ''}
                    `}
                >
                    {isOpen ? <X className="w-6 h-6" /> : (
                        <Image
                            src="/magnifying-glass-icon.jpg"
                            alt="Chat with Waldo"
                            width={28}
                            height={28}
                            className="w-7 h-7 object-contain invert mix-blend-screen"
                        />
                    )}
                    {!isOpen && (
                        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full" />
                    )}
                </button>
            </div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-[90vw] md:w-[420px] h-[620px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Image
                                        src="/magnifying-glass-icon.jpg"
                                        alt="Waldo"
                                        width={20}
                                        height={20}
                                        className="w-5 h-5 object-contain mix-blend-multiply"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Waldo</h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        AI Community Assistant
                                    </p>
                                </div>
                            </div>

                            {activeCommunityName && (
                                <div className="text-xs bg-brand/10 text-brand px-2 py-1 rounded-full font-medium max-w-[130px] truncate">
                                    {activeCommunityName}
                                </div>
                            )}
                        </div>

                        {/* Session Feedback Banner */}
                        <AnimatePresence>
                            {showSessionFeedback && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex items-center justify-between gap-3"
                                >
                                    <p className="text-sm text-blue-800 font-medium">Was Waldo helpful today?</p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleSessionFeedback(1)}
                                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                                        >
                                            <ThumbsUp className="w-3.5 h-3.5" /> Yes
                                        </button>
                                        <button
                                            onClick={() => handleSessionFeedback(-1)}
                                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                                        >
                                            <ThumbsDown className="w-3.5 h-3.5" /> No
                                        </button>
                                        <button
                                            onClick={() => { setShowSessionFeedback(false); setIsOpen(false); }}
                                            className="text-slate-400 hover:text-slate-600 ml-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Content */}
                        {!selectedCommunity ? (
                            /* Community Selector */
                            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Building2 className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">Select Your Community</h3>
                                    <p className="text-sm text-slate-500 mt-2">
                                        I&apos;ll give you answers specific to your neighborhood.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    {communities.length === 0 ? (
                                        <div className="text-center py-4 text-slate-400 text-sm">Loading communities...</div>
                                    ) : (
                                        communities.map((comm) => (
                                            <button
                                                key={comm.id}
                                                onClick={() => setSelectedCommunity(comm.slug)}
                                                className="w-full text-left p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group"
                                            >
                                                <span className="font-medium text-slate-700 group-hover:text-blue-700">{comm.name}</span>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Chat Interface */
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                                ${msg.role === 'user' ? 'bg-slate-200' : 'bg-blue-600'}
                                            `}>
                                                {msg.role === 'user'
                                                    ? <User className="w-5 h-5 text-slate-600" />
                                                    : <Image
                                                        src="/magnifying-glass-icon.jpg"
                                                        alt="Waldo"
                                                        width={20}
                                                        height={20}
                                                        className="w-5 h-5 object-contain invert mix-blend-screen"
                                                    />
                                                }
                                            </div>
                                            <div className="flex flex-col gap-2 max-w-[80%]">
                                                <div className={`
                                                    p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                                                    ${msg.role === 'user'
                                                        ? 'bg-slate-800 text-white rounded-tr-none'
                                                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}
                                                `}>
                                                    <ReactMarkdown
                                                        components={{
                                                            p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                            ul: ({ ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                                            li: ({ ...props }) => <li className="mb-1" {...props} />,
                                                            a: ({ ...props }) => <a className="text-blue-500 hover:underline" target="_blank" rel="noreferrer" {...props} />,
                                                            strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
                                                        }}
                                                    >
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                </div>

                                                {/* Manager Contact Card + Escalation Feedback */}
                                                {msg.managerInfo && (
                                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm">
                                                        <p className="font-semibold text-blue-800 mb-2">Contact Your Manager</p>
                                                        <p className="text-slate-700 font-medium mb-1">{msg.managerInfo.name}</p>
                                                        <a
                                                            href={`mailto:${msg.managerInfo.email}`}
                                                            className="flex items-center gap-1.5 text-blue-600 hover:underline mb-1"
                                                        >
                                                            <Mail className="w-3.5 h-3.5" />
                                                            {msg.managerInfo.email}
                                                        </a>
                                                        <a
                                                            href={`tel:${msg.managerInfo.phone}`}
                                                            className="flex items-center gap-1.5 text-blue-600 hover:underline mb-3"
                                                        >
                                                            <Phone className="w-3.5 h-3.5" />
                                                            {msg.managerInfo.phone}
                                                        </a>

                                                        {/* Escalation Feedback */}
                                                        {ratedMessages.has(idx) ? (
                                                            <p className="text-xs text-slate-400 italic">Thanks for your feedback!</p>
                                                        ) : (
                                                            <div className="border-t border-blue-100 pt-2 mt-1">
                                                                <p className="text-xs text-slate-500 mb-1.5">Was this answer helpful?</p>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleEscalationFeedback(idx, 1)}
                                                                        className="flex items-center gap-1 text-xs px-2.5 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                                                                    >
                                                                        <ThumbsUp className="w-3 h-3" /> Yes
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleEscalationFeedback(idx, -1)}
                                                                        className="flex items-center gap-1 text-xs px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                                                                    >
                                                                        <ThumbsDown className="w-3 h-3" /> No
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Suggested Questions (shown before first user message) */}
                                    {!hasChatted && (
                                        <div className="ml-11">
                                            <p className="text-xs text-slate-400 mb-2">Common questions:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {SUGGESTED_QUESTIONS.map((q) => (
                                                    <button
                                                        key={q}
                                                        onClick={() => sendMessage(q)}
                                                        className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-transparent text-slate-600 rounded-full transition-all"
                                                    >
                                                        {q}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {loading && (
                                        <div className="flex items-center gap-2 text-slate-400 text-xs ml-11">
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                                            <span className="text-slate-400">Waldo is thinking...</span>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Ask about rules, amenities, payments..."
                                            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!input.trim() || loading}
                                            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCommunity(null)}
                                        className="text-[10px] text-slate-400 hover:text-blue-600 mt-2 flex items-center gap-1 mx-auto transition-colors"
                                    >
                                        Change Community
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
