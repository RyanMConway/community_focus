"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
    Mail, Building2, Trash2, CheckCircle, Plus, BookOpen,
    Upload, FileText, Loader, Filter, ShieldAlert, BarChart3,
    TrendingUp, MessageSquare, AlertCircle, RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- CONFIGURATION ---
const AUTHORIZED_EMAILS = [
    "amy@communityfocusnc.com",
    "rconwayak@gmail.com",
    "info@communityfocusnc.com",
    "rconway0825@gmail.com"
];

// --- TYPES ---
interface Message {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    user_type: string;
    message: string;
    created_at: string;
    status: string;
}

interface Community {
    id: number;
    name: string;
    city: string;
    portal_url: string;
    slug: string;
}

interface Document {
    id: string;
    filename: string;
    community_id: number;
    community_name: string;
    chunk_count: number;
    created_at: string;
}

interface AnalyticsData {
    total: number;
    categories: { category: string; count: number }[];
    topics: { topic: string; category: string; count: number }[];
    communities: { name: string; count: number }[];
    feed: { id: number; topic: string; category: string; created_at: string; community_name: string }[];
}

export default function AdminDashboard() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'inbox' | 'communities' | 'knowledge' | 'analytics'>('inbox');

    // Data State
    const [messages, setMessages] = useState<Message[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    // Form State
    const [isAdding, setIsAdding] = useState(false);
    const [newComm, setNewComm] = useState({ name: '', city: 'Durham, NC', portal_url: '', description: '' });

    // Filter State
    const [selectedCommId, setSelectedCommId] = useState<string>("");
    const [analyticsCommId, setAnalyticsCommId] = useState<string>("");

    // --- ACCESS CONTROL CHECK ---
    useEffect(() => {
        if (isLoaded && user) {
            const email = user.primaryEmailAddress?.emailAddress;
            if (email && !AUTHORIZED_EMAILS.includes(email)) {
                // Optional: Redirect logic here
            } else {
                loadData();
            }
        }
    }, [isLoaded, user]);

    // Load Data based on active tab
    useEffect(() => {
        if (activeTab === 'analytics') {
            fetchAnalytics();
        }
    }, [activeTab, analyticsCommId]);

    const loadData = async () => {
        try {
            const [msgData, commData, docData] = await Promise.all([
                fetch('/api/admin/messages').then(res => res.json()),
                fetch('/api/communities').then(res => res.json()),
                fetch('/api/admin/documents').then(res => res.json())
            ]);
            setMessages(msgData || []);
            setCommunities(commData || []);
            setDocuments(docData || []);
        } catch (e) {
            console.error("Load failed", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const query = analyticsCommId ? `?range=30d&communityId=${analyticsCommId}` : '?range=30d';
            const res = await fetch(`/api/admin/analytics${query}`);
            const data = await res.json();
            setAnalytics(data);
        } catch (e) {
            console.error("Analytics fetch failed", e);
        }
    };

    // --- ACTIONS ---

    const handleAddCommunity = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/admin/communities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newComm)
        });

        if (res.ok) {
            loadData();
            setIsAdding(false);
            setNewComm({ name: '', city: 'Durham, NC', portal_url: '', description: '' });
        }
    };

    const handleDeleteCommunity = async (id: number) => {
        if (!confirm('Delete this community? This cannot be undone.')) return;
        await fetch(`/api/admin/communities?id=${id}`, { method: 'DELETE' });
        setCommunities(prev => prev.filter(c => c.id !== id));
    };

    const handleMarkRead = async (id: number) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m));
        await fetch(`/api/admin/messages/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'read' })
        });
    };

    const handleDeleteMessage = async (id: number) => {
        if (!confirm('Delete message?')) return;
        setMessages(prev => prev.filter(m => m.id !== id));
        await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    };

    const handleDeleteDocument = async (filename: string, communityId: number) => {
        if (!confirm(`Permanently delete "${filename}"? This will remove it from the website, storage, and AI.`)) return;
        await fetch(`/api/admin/documents?id=${encodeURIComponent(filename)}&communityId=${communityId}`, {
            method: 'DELETE'
        });
        loadData();
    };

    const handleClearAnalytics = async () => {
        const msg = analyticsCommId
            ? "Are you sure you want to clear analytics for THIS community?"
            : "Are you sure you want to clear ALL analytics data? This cannot be undone.";

        if (!confirm(msg)) return;

        try {
            const query = analyticsCommId ? `?communityId=${analyticsCommId}` : '';
            await fetch(`/api/admin/analytics${query}`, { method: 'DELETE' });
            fetchAnalytics(); // Refresh
        } catch (e) {
            alert("Failed to clear data");
        }
    };

    // --- NEW: Export to CSV ---
    const handleExportCSV = () => {
        if (!analytics) return;

        // 1. Create the CSV Content
        const headers = ["Category", "Count", "Percentage"];
        const rows = analytics.categories.map(c => [
            c.category,
            c.count,
            `${Math.round((c.count / analytics.total) * 100)}%`
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        // 2. Create a Blob and Download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `community_focus_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- HELPER: Simple Bar Chart ---
    const SimpleBarChart = ({ data, total }: { data: { label: string, value: number, color?: string }[], total: number }) => (
        <div className="space-y-3">
            {data.map((item, i) => (
                <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="text-slate-500">{item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                            className={`h-2.5 rounded-full ${item.color || 'bg-brand'}`}
                            style={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );

    if (!isLoaded) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader className="w-8 h-8 text-brand animate-spin" /></div>;

    const userEmail = user?.primaryEmailAddress?.emailAddress;
    if (!userEmail || !AUTHORIZED_EMAILS.includes(userEmail)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 max-w-md w-full">
                    <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h1>
                    <p className="text-red-600 mb-6">
                        You are logged in as <strong>{userEmail}</strong>, but this account does not have administrator privileges.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-white border border-red-200 text-red-700 px-6 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    const filteredDocuments = selectedCommId
        ? documents.filter(d => d.community_id.toString() === selectedCommId)
        : [];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Top Navbar */}
            <div className="bg-brand-dark text-white pt-24 pb-20 px-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end relative z-10">
                    <div>
                        <h1 className="text-3xl font-serif font-bold mb-2">Admin Portal</h1>
                        <p className="text-brand-accent/80">Manage messages, properties, and AI knowledge.</p>
                    </div>
                    <div className="flex gap-2 mt-6 md:mt-0 bg-white/10 p-1 rounded-lg backdrop-blur-sm">
                        <button onClick={() => setActiveTab('inbox')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'inbox' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-300 hover:text-white'}`}>
                            <Mail className="w-4 h-4" /> Inbox
                        </button>
                        <button onClick={() => setActiveTab('communities')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'communities' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-300 hover:text-white'}`}>
                            <Building2 className="w-4 h-4" /> Communities
                        </button>
                        <button onClick={() => setActiveTab('knowledge')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'knowledge' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-300 hover:text-white'}`}>
                            <BookOpen className="w-4 h-4" /> Knowledge Base
                        </button>
                        <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-300 hover:text-white'}`}>
                            <BarChart3 className="w-4 h-4" /> Analytics
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-12 relative z-20">

                {/* TAB 1: INBOX */}
                {activeTab === 'inbox' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100"><h2 className="text-lg font-bold text-slate-800">Messages</h2></div>
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">From</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Message</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                            {messages.map((msg) => (
                                <tr key={msg.id} className={msg.status === 'new' ? 'bg-white' : 'bg-slate-50/50'}>
                                    <td className="px-6 py-4">
                                        <div className="font-bold">{msg.first_name} {msg.last_name}</div>
                                        <div className="text-xs text-slate-500">{msg.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{msg.message}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        {msg.status === 'new' && <button onClick={() => handleMarkRead(msg.id)} className="text-emerald-500 hover:bg-emerald-50 p-2 rounded"><CheckCircle className="w-5 h-5"/></button>}
                                        <button onClick={() => handleDeleteMessage(msg.id)} className="text-red-400 hover:bg-red-50 p-2 rounded"><Trash2 className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 2: COMMUNITIES */}
                {activeTab === 'communities' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-slate-800">Manage Communities</h2>
                                <button onClick={() => setIsAdding(!isAdding)} className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
                                    <Plus className="w-4 h-4" /> {isAdding ? 'Cancel' : 'Add New'}
                                </button>
                            </div>
                            {isAdding && (
                                <form onSubmit={handleAddCommunity} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input required placeholder="Name" className="p-2 rounded border" value={newComm.name} onChange={e => setNewComm({...newComm, name: e.target.value})} />
                                        <input placeholder="City" className="p-2 rounded border" value={newComm.city} onChange={e => setNewComm({...newComm, city: e.target.value})} />
                                        <input required placeholder="Portal URL" className="p-2 rounded border md:col-span-2" value={newComm.portal_url} onChange={e => setNewComm({...newComm, portal_url: e.target.value})} />
                                    </div>
                                    <button className="bg-brand-dark text-white px-6 py-2 rounded-lg font-bold">Save</button>
                                </form>
                            )}
                            <div className="grid gap-4">
                                {communities.map((c) => (
                                    <div key={c.id} className="flex justify-between p-4 border rounded bg-white items-center">
                                        <div>
                                            <div className="font-bold text-slate-800">{c.name}</div>
                                            <div className="text-xs text-slate-500">{c.city}</div>
                                        </div>
                                        <button onClick={() => handleDeleteCommunity(c.id)} className="text-red-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: KNOWLEDGE BASE */}
                {activeTab === 'knowledge' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Knowledge Base Manager</h2>
                            <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
                                <div className="w-full md:w-1/2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Filter by Community</label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-3 rounded-lg border border-slate-300 bg-white appearance-none cursor-pointer hover:border-brand/50 focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                                            value={selectedCommId}
                                            onChange={(e) => setSelectedCommId(e.target.value)}
                                        >
                                            <option value="">-- View All Communities --</option>
                                            {communities.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="w-full md:w-auto">
                                    <button
                                        onClick={() => router.push('/admin/upload')}
                                        className="w-full bg-brand text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-brand-dark hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Upload className="w-5 h-5" />
                                        Upload New Document
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-800">
                                    {selectedCommId
                                        ? `Active Files for ${communities.find(c => c.id.toString() === selectedCommId)?.name}`
                                        : "All Active Files"}
                                </h2>
                                <span className="text-xs text-slate-400">
                                    {selectedCommId
                                        ? `${filteredDocuments.length} document(s)`
                                        : "Select a community to filter"}
                                </span>
                            </div>

                            {selectedCommId ? (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Document Name</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Knowledge Chunks</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                    {filteredDocuments.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">No documents found for this community.</td>
                                        </tr>
                                    ) : (
                                        filteredDocuments.map((doc, idx) => (
                                            <tr key={doc.id + idx} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-brand-accent" />
                                                    {doc.filename}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">
                                                            {doc.chunk_count}
                                                        </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteDocument(doc.filename, doc.community_id)}
                                                        className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                                                        title="Delete File"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
                                    <Filter className="w-12 h-12 mb-4 text-slate-200" />
                                    <p className="font-medium text-slate-500">No Community Selected</p>
                                    <p className="text-sm">Please select a community from the dropdown above to view its files.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 4: ANALYTICS (UPDATED) */}
                {activeTab === 'analytics' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* 1. Header & Controls */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="w-full md:w-1/3">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Filter Stats by Community</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-3 rounded-lg border border-slate-300 bg-white appearance-none cursor-pointer hover:border-brand/50 focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                                        value={analyticsCommId}
                                        onChange={(e) => setAnalyticsCommId(e.target.value)}
                                    >
                                        <option value="">-- View All Communities --</option>
                                        {communities.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleExportCSV}
                                    className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-brand px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    Export CSV
                                </button>

                                <button
                                    onClick={handleClearAnalytics}
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {analyticsCommId ? "Clear Community" : "Clear History"}
                                </button>
                            </div>
                        </div>

                        {!analytics ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <Loader className="w-8 h-8 text-brand animate-spin mx-auto mb-4" />
                                <p className="text-slate-500">Crunching the numbers...</p>
                            </div>
                        ) : (
                            <>
                                {/* Overview Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-blue-50 text-brand rounded-lg"><MessageSquare className="w-5 h-5"/></div>
                                            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide">Total Queries (30d)</h3>
                                        </div>
                                        <p className="text-4xl font-bold text-slate-800">{analytics.total}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><AlertCircle className="w-5 h-5"/></div>
                                            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide">Top Issue</h3>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-800 truncate">
                                            {analytics.topics[0]?.topic || "N/A"}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">Most frequent topic detected</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp className="w-5 h-5"/></div>
                                            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide">Top Category</h3>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-800 truncate">
                                            {analytics.categories[0]?.category || "N/A"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Category Breakdown */}
                                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                                        <h3 className="text-lg font-bold text-slate-800 mb-6">Inquiry Categories</h3>
                                        {analytics.categories.length === 0 ? <p className="text-slate-400 text-sm">No data yet.</p> : (
                                            <SimpleBarChart
                                                total={analytics.total}
                                                data={analytics.categories.map(c => ({
                                                    label: c.category,
                                                    value: parseInt(c.count as any),
                                                    color: c.category === 'Complaint' ? 'bg-red-500' : c.category === 'Maintenance' ? 'bg-orange-500' : 'bg-brand'
                                                }))}
                                            />
                                        )}
                                    </div>

                                    {/* Top Specific Topics */}
                                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                                        <h3 className="text-lg font-bold text-slate-800 mb-6">Top Specific Topics</h3>
                                        {analytics.topics.length === 0 ? <p className="text-slate-400 text-sm">No data yet.</p> : (
                                            <div className="space-y-4">
                                                {analytics.topics.map((t, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-mono text-slate-400 text-sm w-4">#{i+1}</span>
                                                            <span className="font-bold text-slate-700">{t.topic}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                                                                t.category === 'Complaint' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                                            }`}>
                                                                {t.category}
                                                            </span>
                                                            <span className="font-bold text-slate-900">{t.count}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Live Feed */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-slate-800">Recent Live Activity</h3>
                                        <button onClick={fetchAnalytics} className="text-slate-400 hover:text-brand"><RefreshCw className="w-4 h-4"/></button>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Time</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Community</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Topic</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                            {analytics.feed.length === 0 ? (
                                                <tr><td colSpan={4} className="p-8 text-center text-slate-400">No activity recorded yet.</td></tr>
                                            ) : (
                                                analytics.feed.map((item) => (
                                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-3 text-sm text-slate-400">
                                                            {new Date(item.created_at).toLocaleDateString()} <span className="text-xs opacity-70">{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                        </td>
                                                        <td className="px-6 py-3 text-sm font-medium text-slate-700">{item.community_name}</td>
                                                        <td className="px-6 py-3 text-sm text-slate-600">{item.topic}</td>
                                                        <td className="px-6 py-3">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                    item.category === 'Complaint' ? 'bg-red-50 text-red-700 ring-1 ring-red-600/10' :
                                                                        item.category === 'Maintenance' ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/10' :
                                                                            'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10'
                                                                }`}>
                                                                    {item.category}
                                                                </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}