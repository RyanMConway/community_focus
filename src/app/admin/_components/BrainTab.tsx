"use client";

import { useState } from 'react';
import { Loader, Search, Bot } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Community } from './types';

interface Props {
    communities: Community[];
}

export default function BrainTab({ communities }: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ content: string; filename: string; community_name: string }[]>([]);
    const [answer, setAnswer] = useState<string>("");
    const [isSearching, setIsSearching] = useState(false);
    const [communityId, setCommunityId] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        setAnswer("");
        setResults([]);

        try {
            const res = await fetch('/api/admin/brain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, community_id: communityId })
            });
            const data = await res.json();
            setAnswer(data.answer || "No answer generated.");
            setResults(data.sources || []);
        } catch {
            toast.error("Brain search failed.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 min-h-[600px]">
            <div className="text-center max-w-2xl mx-auto mb-10">
                <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Admin Brain</h2>
                <p className="text-slate-500">
                    Ask questions about community rules, bylaws, or regulations.
                    The AI will read the documents and summarize the answer for you.
                </p>
            </div>

            <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-12 relative">
                <div className="mb-4 flex justify-center">
                    <select
                        className="p-2 border rounded-lg text-sm bg-slate-50 font-medium text-slate-600"
                        value={communityId}
                        onChange={(e) => setCommunityId(e.target.value)}
                    >
                        <option value="">-- Search Entire Database --</option>
                        {communities.map(c => <option key={c.id} value={c.id}>Focus on: {c.name}</option>)}
                    </select>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="e.g. 'What are the fence height limits?'"
                        className="w-full p-5 pl-6 pr-16 rounded-full border-2 border-slate-200 shadow-sm focus:border-brand focus:outline-none text-lg"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={isSearching || !query.trim()}
                        className="absolute right-2 top-2 p-3 bg-brand text-white rounded-full hover:bg-brand-dark disabled:opacity-50 transition-colors"
                    >
                        {isSearching ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </button>
                </div>
            </form>

            <div className="max-w-4xl mx-auto space-y-8">
                {answer && (
                    <div className="bg-blue-50/50 p-8 rounded-2xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        <h3 className="font-bold text-brand-dark flex items-center gap-2 mb-4">
                            <Bot className="w-5 h-5" /> AI Answer
                        </h3>
                        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
                            {answer}
                        </div>
                    </div>
                )}

                {results.length > 0 && (
                    <div>
                        <h3 className="font-bold text-slate-400 uppercase tracking-wider text-xs mb-4 ml-1">Sources Cited</h3>
                        <div className="grid gap-3">
                            {results.map((result, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-brand/30 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold text-slate-600 uppercase">
                                            {result.community_name}
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">{result.filename}</span>
                                    </div>
                                    <p className="text-slate-500 text-xs line-clamp-2 italic">
                                        &ldquo;...{result.content.substring(0, 150)}...&rdquo;
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {results.length === 0 && !isSearching && query && !answer && (
                    <div className="text-center text-slate-400 py-10">No relevant documents found.</div>
                )}
            </div>
        </div>
    );
}
