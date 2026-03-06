"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Bot, Building2, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);

    // Community Selection State
    const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
    const [communities, setCommunities] = useState<{id: number, name: string, slug: string}[]>([]);

    // Shimmy State
    const [isShimmying, setIsShimmying] = useState(false);

    // --- UPDATED INITIAL MESSAGE ---
    const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
        { role: 'bot', text: "Hello! I am Waldo, the Community Focus AI Assistant. I can answer questions about your specific community's rules, amenities, and payments. How can I help?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Auto-scroll to bottom
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    // Shimmy Effect: Triggers every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isOpen) { // Only shimmy if closed
                setIsShimmying(true);
                // Remove class after animation plays (0.8s)
                setTimeout(() => setIsShimmying(false), 800);
            }
        }, 30000); // 30 seconds

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !selectedCommunity) return;

        // 1. Find the correct Community Name (Backend expects Name, not Slug)
        const activeComm = communities.find(c => c.slug === selectedCommunity);
        const communityName = activeComm ? activeComm.name : selectedCommunity;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: messages,
                    communityName: communityName
                })
            });

            const data = await res.json();

            if (data.error) throw new Error(data.error);

            setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'bot', text: "I'm having trouble connecting right now. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Main Toggle Button (Floating) */}
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4">

                {/* Optional "Call to Action" Bubble that appears during shimmy */}
                <AnimatePresence>
                    {isShimmying && !isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="bg-white text-slate-800 px-4 py-2 rounded-xl shadow-lg border border-slate-100 text-sm font-semibold hidden md:block"
                        >
                            Need help? Chat with us!
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        p-4 rounded-full shadow-2xl transition-all duration-300 relative group
                        ${isOpen ? 'bg-white text-slate-800 rotate-90' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'}
                        ${isShimmying ? 'animate-shimmy' : ''}
                    `}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 fill-current" />}

                    {/* Notification Dot (always shows if closed) */}
                    {!isOpen && (
                        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
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
                        className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Waldo</h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Online
                                    </p>
                                </div>
                            </div>

                            {/* Selected Community Badge */}
                            {selectedCommunity && (
                                <div className="text-xs bg-brand/10 text-brand px-2 py-1 rounded-full font-medium max-w-[120px] truncate">
                                    {communities.find(c => c.slug === selectedCommunity)?.name || selectedCommunity}
                                </div>
                            )}
                        </div>

                        {/* Content Area */}
                        {!selectedCommunity ? (
                            // 1. Community Selector View
                            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Building2 className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">Select Your Community</h3>
                                    <p className="text-sm text-slate-500 mt-2">
                                        To provide accurate answers, please tell me which community you belong to.
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
                            // 2. Chat Interface View
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                        >
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                                ${msg.role === 'user' ? 'bg-slate-200' : 'bg-blue-600'}
                                            `}>
                                                {msg.role === 'user' ? <User className="w-5 h-5 text-slate-600" /> : <Bot className="w-5 h-5 text-white" />}
                                            </div>
                                            <div className={`
                                                max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                                                ${msg.role === 'user'
                                                ? 'bg-slate-800 text-white rounded-tr-none'
                                                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}
                                            `}>
                                                <ReactMarkdown
                                                    components={{
                                                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                                        a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" {...props} />
                                                    }}
                                                >
                                                    {msg.text}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="flex items-center gap-2 text-slate-400 text-xs ml-12">
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Ask a question..."
                                            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                                        className="text-[10px] text-slate-400 hover:text-blue-600 mt-2 flex items-center gap-1 mx-auto"
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