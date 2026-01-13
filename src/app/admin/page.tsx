"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
    Mail, Building2, Trash2, CheckCircle, Plus, BookOpen,
    Upload, FileText, Loader, Filter, ShieldAlert, BarChart3,
    TrendingUp, MessageSquare, AlertCircle, RefreshCw, Users, Briefcase,
    BrainCircuit, Search, Edit2
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
    // New Fields
    alert_message?: string;
    alert_type?: 'info' | 'warning' | 'emergency';
}

interface Manager {
    id: number;
    name: string;
    email: string;
    phone: string;
    communities: { id: number; name: string }[];
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
    const [activeTab, setActiveTab] = useState<'inbox' | 'communities' | 'managers' | 'knowledge' | 'analytics' | 'brain'>('inbox');

    // Data State
    const [messages, setMessages] = useState<Message[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    // -- STATE FOR COMMUNITIES --
    const [isCommModalOpen, setIsCommModalOpen] = useState(false);
    const [editingComm, setEditingComm] = useState<Community>({
        id: 0, name: '', city: 'Durham, NC', portal_url: '', slug: '', alert_message: '', alert_type: 'info'
    });

    // -- STATE FOR MANAGERS --
    const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
    const [editingManager, setEditingManager] = useState<Manager | null>(null);

    // -- STATE FOR BRAIN SEARCH --
    const [brainQuery, setBrainQuery] = useState("");
    const [brainResults, setBrainResults] = useState<any[]>([]);
    const [isBrainSearching, setIsBrainSearching] = useState(false);

    // -- STATE FOR FILTERS --
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
        if (activeTab === 'analytics') fetchAnalytics();
        if (activeTab === 'managers') loadManagers();
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

    const loadManagers = async () => {
        const res = await fetch('/api/admin/managers');
        const data = await res.json();
        setManagers(data);
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

    // --- ACTIONS: COMMUNITIES ---
    const handleSaveCommunity = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingComm.id === 0 ? 'POST' : 'PUT';

        const res = await fetch('/api/admin/communities', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingComm)
        });

        if (res.ok) {
            loadData();
            setIsCommModalOpen(false);
        }
    };

    const handleDeleteCommunity = async (id: number) => {
        if (!confirm('Delete this community? This cannot be undone.')) return;
        await fetch(`/api/admin/communities?id=${id}`, { method: 'DELETE' });
        setCommunities(prev => prev.filter(c => c.id !== id));
    };

    // --- ACTIONS: MANAGERS ---
    const handleSaveManager = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingManager) return;
        const method = editingManager.id === 0 ? 'POST' : 'PUT';

        const form = e.target as HTMLFormElement;
        const selectedCommIds = Array.from(form.elements)
            .filter((el: any) => el.name === 'communities' && el.checked)
            .map((el: any) => parseInt(el.value));

        const payload = { ...editingManager, community_ids: selectedCommIds };

        const res = await fetch('/api/admin/managers', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            loadManagers();
            setIsManagerModalOpen(false);
            setEditingManager(null);
        }
    };

    // --- ACTIONS: BRAIN SEARCH ---
    const handleBrainSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsBrainSearching(true);
        try {
            const res = await fetch('/api/admin/brain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: brainQuery })
            });
            const data = await res.json();
            setBrainResults(data.results || []);
        } finally {
            setIsBrainSearching(false);
        }
    };

    // --- GENERIC ACTIONS ---
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
        if (!confirm(`Permanently delete "${filename}"?`)) return;
        await fetch(`/api/admin/documents?id=${encodeURIComponent(filename)}&communityId=${communityId}`, { method: 'DELETE' });
        loadData();
    };

    const handleClearAnalytics = async () => {
        const msg = analyticsCommId ? "Clear analytics for THIS community?" : "Clear ALL analytics data?";
        if (!confirm(msg)) return;
        try {
            const query = analyticsCommId ? `?communityId=${analyticsCommId}` : '';
            await fetch(`/api/admin/analytics${query}`, { method: 'DELETE' });
            fetchAnalytics();
        } catch (e) { alert("Failed"); }
    };

    const handleExportCSV = () => {
        if (!analytics) return;
        const headers = ["Category", "Count", "Percentage"];
        const rows = analytics.categories.map(c => [c.category, c.count, `${Math.round((c.count / analytics.total) * 100)}%`]);
        const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `report.csv`;
        link.click();
    };

    const SimpleBarChart = ({ data, total }: { data: { label: string, value: number, color?: string }[], total: number }) => (
        <div className="space-y-3">
            {data.map((item, i) => (
                <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="text-slate-500">{item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className={`h-2.5 rounded-full ${item.color || 'bg-brand'}`} style={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
    );

    if (!isLoaded) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader className="w-8 h-8 text-brand animate-spin" /></div>;

    const userEmail = user?.primaryEmailAddress?.emailAddress;
    if (!userEmail || !AUTHORIZED_EMAILS.includes(userEmail)) return <div>Access Denied</div>;

    const filteredDocuments = selectedCommId ? documents.filter(d => d.community_id.toString() === selectedCommId) : [];

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
                    <div className="flex gap-2 mt-6 md:mt-0 bg-white/10 p-1 rounded-lg backdrop-blur-sm overflow-x-auto max-w-full">
                        <button onClick={() => setActiveTab('inbox')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'inbox' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-300 hover:text-white'}`}>
                            <Mail className="w-4 h-4" /> Inbox
                        </button>
                        <button onClick={() => setActiveTab('communities')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'communities' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-300 hover:text-white'}`}>
                            <Building2 className="w-4 h-4" /> Communities
                        </button>
                        <button onClick={() => setActiveTab('managers')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'managers' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-300 hover:text-white'}`}>
                            <Users className="w-4 h-4" /> Managers
                        </button>
                        <button onClick={() => setActiveTab('brain')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'brain' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-300 hover:text-white'}`}>
                            <BrainCircuit className="w-4 h-4" /> Brain
                        </button>
                        <button onClick={() => setActiveTab('knowledge')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'knowledge' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-300 hover:text-white'}`}>
                            <BookOpen className="w-4 h-4" /> Knowledge
                        </button>
                        <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-300 hover:text-white'}`}>
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

                {/* TAB 2: COMMUNITIES (UPDATED WITH ALERTS & EDIT) */}
                {activeTab === 'communities' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-slate-800">Manage Communities</h2>
                                <button
                                    onClick={() => {
                                        setEditingComm({ id: 0, name: '', city: 'Durham, NC', portal_url: '', slug: '', alert_message: '', alert_type: 'info' });
                                        setIsCommModalOpen(true);
                                    }}
                                    className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                                >
                                    <Plus className="w-4 h-4" /> Add New
                                </button>
                            </div>

                            <div className="grid gap-4">
                                {communities.map((c) => (
                                    <div key={c.id} className="flex justify-between p-4 border rounded bg-white items-center">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <div className="font-bold text-slate-800 flex items-center gap-2">
                                                    {c.name}
                                                    {c.alert_message && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Alert Active</span>}
                                                </div>
                                                <div className="text-xs text-slate-500">{c.city}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => { setEditingComm(c); setIsCommModalOpen(true); }}
                                                className="text-brand hover:bg-blue-50 p-2 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteCommunity(c.id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* COMMUNITY MODAL */}
                        {isCommModalOpen && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl">
                                    <h3 className="text-xl font-bold mb-6">{editingComm.id === 0 ? 'Add Community' : 'Edit Community'}</h3>
                                    <form onSubmit={handleSaveCommunity} className="space-y-4">
                                        <input required placeholder="Name" className="w-full p-3 border rounded-lg" value={editingComm.name} onChange={e => setEditingComm({...editingComm, name: e.target.value})} />
                                        <input placeholder="City" className="w-full p-3 border rounded-lg" value={editingComm.city} onChange={e => setEditingComm({...editingComm, city: e.target.value})} />
                                        <input required placeholder="Portal URL" className="w-full p-3 border rounded-lg" value={editingComm.portal_url} onChange={e => setEditingComm({...editingComm, portal_url: e.target.value})} />

                                        <div className="border-t pt-4 mt-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Community Alert Banner</label>
                                            <textarea
                                                placeholder="Alert Message (e.g. 'Water shut off tomorrow'). Leave empty to disable."
                                                className="w-full p-3 border rounded-lg h-24 mb-2"
                                                value={editingComm.alert_message || ''}
                                                onChange={e => setEditingComm({...editingComm, alert_message: e.target.value})}
                                            />
                                            <select
                                                className="w-full p-3 border rounded-lg"
                                                value={editingComm.alert_type || 'info'}
                                                onChange={e => setEditingComm({...editingComm, alert_type: e.target.value as any})}
                                            >
                                                <option value="info">Info (Blue)</option>
                                                <option value="warning">Warning (Orange)</option>
                                                <option value="emergency">Emergency (Red)</option>
                                            </select>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button type="button" onClick={() => setIsCommModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">Cancel</button>
                                            <button type="submit" className="flex-1 py-3 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark">Save</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: MANAGERS */}
                {activeTab === 'managers' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-slate-800">Community Managers</h2>
                                <button
                                    onClick={() => {
                                        setEditingManager({ id: 0, name: '', email: '', phone: '', communities: [] });
                                        setIsManagerModalOpen(true);
                                    }}
                                    className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                                >
                                    <Plus className="w-4 h-4" /> Add Manager
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {managers.map((m) => (
                                    <div key={m.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-800">{m.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                    <Mail className="w-3 h-3" /> {m.email || "No email"}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <Briefcase className="w-3 h-3" /> {m.phone || "No phone"}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => { setEditingManager(m); setIsManagerModalOpen(true); }}
                                                className="text-brand font-bold text-sm hover:underline"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Communities</h4>
                                            {m.communities.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {m.communities.map(c => (
                                                        <span key={c.id} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 font-medium">
                                                            {c.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-slate-400 italic">No communities assigned.</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* MANAGER MODAL */}
                        {isManagerModalOpen && editingManager && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl">
                                    <h3 className="text-xl font-bold mb-6">{editingManager.id === 0 ? 'Add Manager' : 'Edit Manager'}</h3>
                                    <form onSubmit={handleSaveManager} className="space-y-4">
                                        <input
                                            placeholder="Full Name"
                                            className="w-full p-3 border rounded-lg"
                                            value={editingManager.name}
                                            onChange={e => setEditingManager({...editingManager, name: e.target.value})}
                                            required
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                placeholder="Email"
                                                className="w-full p-3 border rounded-lg"
                                                value={editingManager.email}
                                                onChange={e => setEditingManager({...editingManager, email: e.target.value})}
                                            />
                                            <input
                                                placeholder="Phone"
                                                className="w-full p-3 border rounded-lg"
                                                value={editingManager.phone}
                                                onChange={e => setEditingManager({...editingManager, phone: e.target.value})}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-500 mb-2">Assign Communities</label>
                                            <div className="h-48 overflow-y-auto border rounded-lg p-3 space-y-2 bg-slate-50">
                                                {communities.map(c => (
                                                    <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded">
                                                        <input
                                                            type="checkbox"
                                                            name="communities"
                                                            value={c.id}
                                                            defaultChecked={editingManager.communities.some(mc => mc.id === c.id)}
                                                            className="w-4 h-4 text-brand rounded"
                                                        />
                                                        <span className="text-sm text-slate-700">{c.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button type="button" onClick={() => setIsManagerModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">Cancel</button>
                                            <button type="submit" className="flex-1 py-3 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark">Save Changes</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: BRAIN SEARCH (NEW) */}
                {activeTab === 'brain' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 min-h-[600px]">
                        <div className="text-center max-w-2xl mx-auto mb-10">
                            <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
                                <BrainCircuit className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Admin Brain Search</h2>
                            <p className="text-slate-500">Query your entire document database across all communities at once. Perfect for finding specific rules or checking consistency.</p>
                        </div>

                        <form onSubmit={handleBrainSearch} className="max-w-3xl mx-auto mb-12 relative">
                            <input
                                type="text"
                                placeholder="e.g. 'What are the fence height limits?' or 'Which communities ban solar panels?'"
                                className="w-full p-5 pl-6 pr-16 rounded-full border-2 border-slate-200 shadow-sm focus:border-brand focus:outline-none text-lg"
                                value={brainQuery}
                                onChange={(e) => setBrainQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={isBrainSearching || !brainQuery.trim()}
                                className="absolute right-2 top-2 p-3 bg-brand text-white rounded-full hover:bg-brand-dark disabled:opacity-50 transition-colors"
                            >
                                {isBrainSearching ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            </button>
                        </form>

                        <div className="max-w-4xl mx-auto space-y-6">
                            {brainResults.length > 0 && (
                                <h3 className="font-bold text-slate-400 uppercase tracking-wider text-xs mb-4">Search Results</h3>
                            )}

                            {brainResults.map((result, i) => (
                                <div key={i} className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-brand">
                                            {result.community_name}
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">{result.filename}</span>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed text-sm">
                                        "...{result.content}..."
                                    </p>
                                </div>
                            ))}

                            {brainResults.length === 0 && !isBrainSearching && brainQuery && (
                                <div className="text-center text-slate-400 py-10">No relevant documents found.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 5: KNOWLEDGE (Existing code...) */}
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

                {/* TAB 6: ANALYTICS (Existing code...) */}
                {activeTab === 'analytics' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Header & Controls */}
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
                            </>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}