"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Bot, Building2, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);

    // NEW: State for community selection
    const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
    const [communities, setCommunities] = useState<{id: number, name: string}[]>([]);

    const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
        { role: 'bot', text: "Hello! I am the Community Focus AI Assistant. I can answer questions about your specific community's rules, amenities, and payments. How can I help?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Auto-scroll to bottom
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    // NEW: Fetch communities when widget opens
    useEffect(() => {
        if (isOpen && communities.length === 0) {
            fetch('/api/communities')
                .then(res => res.json())
                .then(data => setCommunities(data))
                .catch(err => console.error("Failed to load communities", err));
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !selectedCommunity) return;

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
                    // NEW: Explicitly send the selected community
                    communityName: selectedCommunity
                })
            });

            const data = await res.json();

            if (data.reply) {
                setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'bot', text: "I'm having trouble connecting right now. Please try again later." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', text: "Connection error. Please check your internet." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end font-sans">

            {/* CHAT WINDOW */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[90vw] md:w-[400px] h-[500px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-brand text-white p-4 flex justify-between items-center shadow-md flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 p-1.5 rounded-lg">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Community Assistant</h3>
                                    {selectedCommunity && (
                                        <div className="flex items-center gap-1 text-xs text-blue-100 opacity-90">
                                            <Building2 className="w-3 h-3" />
                                            <span className="truncate max-w-[150px]">{selectedCommunity}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* CONTENT AREA: Toggle between Selector and Chat */}
                        {!selectedCommunity ? (
                            // --- STATE 1: COMMUNITY SELECTOR ---
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col items-center justify-center text-center">
                                <div className="bg-white p-4 rounded-full shadow-sm mb-4 text-brand">
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Select Your Community</h3>
                                <p className="text-slate-500 text-sm mb-6">
                                    To give you accurate answers, please tell us which community you live in.
                                </p>

                                {communities.length === 0 ? (
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span> Loading...
                                    </div>
                                ) : (
                                    <div className="w-full space-y-2 max-h-[250px] overflow-y-auto pr-1">
                                        {communities.map(comm => (
                                            <button
                                                key={comm.id}
                                                onClick={() => setSelectedCommunity(comm.name)}
                                                className="w-full text-left px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-brand hover:shadow-md transition-all flex items-center justify-between group"
                                            >
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-brand">{comm.name}</span>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            // --- STATE 2: CHAT INTERFACE ---
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-300' : 'bg-brand'}`}>
                                                    {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                                    msg.role === 'user'
                                                        ? 'bg-brand text-white rounded-br-none'
                                                        : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                                                }`}>
                                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                                                <span className="w-2 h-2 bg-brand/50 rounded-full animate-bounce"></span>
                                                <span className="w-2 h-2 bg-brand/50 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                                                <span className="w-2 h-2 bg-brand/50 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100 flex gap-2 flex-shrink-0">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask about rules, parking, etc..."
                                        className="flex-1 bg-slate-100 border-none outline-none focus:ring-2 focus:ring-brand/20 rounded-full px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || !input.trim()}
                                        className="bg-brand hover:bg-brand-dark text-white p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:scale-105 active:scale-95"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TOGGLE BUTTON */}
            <motion.button
                id="chat-trigger"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-brand hover:bg-brand-dark text-white rounded-full shadow-glow flex items-center justify-center transition-colors"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </motion.button>
        </div>
    );
}