"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Define message type
type ChatMessage = {
    role: 'user' | 'bot';
    text: string;
};

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'bot', text: "Hello! I am the Community Focus Assistant. To better help you, could you please tell me which **Community** you are with and whether you are a **Homeowner**, **Tenant**, or **Board Member**?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Auto-scroll to bottom
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;

        // Add user message immediately
        const newHistory = [...messages, { role: 'user', text: userMsg } as ChatMessage];
        setMessages(newHistory);

        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // SEND FULL HISTORY so the bot has memory
                body: JSON.stringify({
                    message: userMsg,
                    history: newHistory
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
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">

            {/* CHAT WINDOW */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[90vw] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-brand text-white p-4 flex justify-between items-center shadow-md">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 p-1.5 rounded-lg">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Community Assistant</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        <span className="text-xs text-blue-100">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                                        {/* Avatar */}
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-300' : 'bg-brand'}`}>
                                            {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
                                        </div>

                                        {/* Bubble */}
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

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
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
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TOGGLE BUTTON */}
            <motion.button
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