"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
    Mail, Building2, Trash2, CheckCircle, Plus, BookOpen,
    Upload, FileText, Loader, Filter, ShieldAlert, BarChart3,
    TrendingUp, MessageSquare, AlertCircle, RefreshCw, Users, Briefcase,
    BrainCircuit, Search, Edit2, Calendar, Megaphone, HardHat, Bot, Menu, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast'; // NEW IMPORT

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
    alert_message?: string;
    alert_type?: 'info' | 'warning' | 'emergency';
    alert_start_time?: string;
    alert_end_time?: string;
}

interface Vendor {
    id: number;
    name: string;
    specialty: string;
    website_url: string;
    active: boolean;
}

interface Event {
    id: number;
    community_id: number;
    title: string;
    event_date: string;
    event_time: string;
    location: string;
}

interface NewsPost {
    id: number;
    community_id: number;
    title: string;
    content: string;
    created_at: string;
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
    const [activeTab, setActiveTab] = useState<'inbox' | 'communities' | 'managers' | 'vendors' | 'events' | 'news' | 'knowledge' | 'analytics' | 'brain'>('inbox');

    // Auth State
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    // Data State
    const [messages, setMessages] = useState<Message[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [news, setNews] = useState<NewsPost[]>([]);

    const [loading, setLoading] = useState(true);

    // -- STATE FOR COMMUNITIES --
    const [isCommModalOpen, setIsCommModalOpen] = useState(false);
    const [editingComm, setEditingComm] = useState<Community>({
        id: 0, name: '', city: 'Durham, NC', portal_url: '', slug: '', alert_message: '', alert_type: 'info', alert_start_time: '', alert_end_time: ''
    });

    // -- STATE FOR MANAGERS --
    const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
    const [editingManager, setEditingManager] = useState<Manager | null>(null);

    // -- STATE FOR NEW FEATURES --
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<Vendor>({ id: 0, name: '', specialty: '', website_url: '', active: true });

    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event>({ id: 0, community_id: 0, title: '', event_date: '', event_time: '', location: '' });

    const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState<NewsPost>({ id: 0, community_id: 0, title: '', content: '', created_at: '' });

    // -- STATE FOR BRAIN SEARCH --
    const [brainQuery, setBrainQuery] = useState("");
    const [brainResults, setBrainResults] = useState<any[]>([]); // Sources
    const [brainAnswer, setBrainAnswer] = useState<string>(""); // AI Answer
    const [isBrainSearching, setIsBrainSearching] = useState(false);
    const [brainCommunityId, setBrainCommunityId] = useState("");

    // -- STATE FOR FILTERS --
    const [selectedCommId, setSelectedCommId] = useState<string>("");
    const [analyticsCommId, setAnalyticsCommId] = useState<string>("");

    // --- ACCESS CONTROL CHECK ---
    useEffect(() => {
        if (isLoaded && user) {
            fetch('/api/auth/me')
                .then(res => res.json())
                .then(data => {
                    if (data.authorized) {
                        setIsAuthorized(true);
                        loadData();
                    } else {
                        setIsAuthorized(false);
                        setLoading(false);
                    }
                })
                .catch(err => {
                    console.error("Auth check failed", err);
                    setIsAuthorized(false);
                    setLoading(false);
                });
        }
    }, [isLoaded, user]);

    // Load Data based on active tab
    useEffect(() => {
        if (activeTab === 'analytics' && isAuthorized) fetchAnalytics();
        if (activeTab === 'managers' && isAuthorized) loadManagers();
        if (activeTab === 'vendors' && isAuthorized) loadVendors();
        if (activeTab === 'events' && isAuthorized) loadEvents();
        if (activeTab === 'news' && isAuthorized) loadNews();
    }, [activeTab, analyticsCommId, isAuthorized]);

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
            toast.error("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const loadManagers = async () => fetch('/api/admin/managers').then(res => res.json()).then(setManagers);
    const loadVendors = async () => fetch('/api/admin/vendors').then(res => res.json()).then(setVendors).catch(() => setVendors([]));
    const loadEvents = async () => fetch('/api/admin/events').then(res => res.json()).then(setEvents).catch(() => setEvents([]));
    const loadNews = async () => fetch('/api/admin/news').then(res => res.json()).then(setNews).catch(() => setNews([]));

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

    // --- GENERIC HELPERS (With Toasts) ---
    const handleSaveGeneric = async (url: string, data: any, refreshFn: () => void, modalSetter: (v: boolean) => void) => {
        const method = data.id === 0 ? 'POST' : 'PUT';
        const loadToast = toast.loading("Saving...");
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                refreshFn();
                modalSetter(false);
                toast.success("Saved successfully!", { id: loadToast });
            } else {
                toast.error("Failed to save.", { id: loadToast });
            }
        } catch(e) {
            console.error(e);
            toast.error("Network error occurred.", { id: loadToast });
        }
    };

    const handleDeleteGeneric = async (url: string, id: number, refreshFn: () => void) => {
        if (!confirm('Are you sure?')) return;
        const loadToast = toast.loading("Deleting...");
        try {
            const res = await fetch(`${url}?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                refreshFn();
                toast.success("Deleted!", { id: loadToast });
            } else {
                toast.error("Failed to delete.", { id: loadToast });
            }
        } catch (e) {
            toast.error("Error occurred.", { id: loadToast });
        }
    };

    // --- SPECIFIC HANDLERS (With Toasts) ---
    const handleSaveCommunity = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingComm.id === 0 ? 'POST' : 'PUT';
        const loadToast = toast.loading("Saving community...");
        const res = await fetch('/api/admin/communities', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingComm)
        });
        if (res.ok) {
            loadData();
            setIsCommModalOpen(false);
            toast.success("Community saved!", { id: loadToast });
        } else {
            toast.error("Failed to save community.", { id: loadToast });
        }
    };

    const handleDeleteCommunity = async (id: number) => {
        if (!confirm('Delete this community? This cannot be undone.')) return;
        await fetch(`/api/admin/communities?id=${id}`, { method: 'DELETE' });
        setCommunities(prev => prev.filter(c => c.id !== id));
        toast.success("Community deleted.");
    };

    const handleSaveManager = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingManager) return;
        const method = editingManager.id === 0 ? 'POST' : 'PUT';
        const form = e.target as HTMLFormElement;
        const selectedCommIds = Array.from(form.elements)
            .filter((el: any) => el.name === 'communities' && el.checked)
            .map((el: any) => parseInt(el.value));
        const payload = { ...editingManager, community_ids: selectedCommIds };

        const loadToast = toast.loading("Saving manager...");
        const res = await fetch('/api/admin/managers', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) {
            loadManagers();
            setIsManagerModalOpen(false);
            setEditingManager(null);
            toast.success("Manager saved!", { id: loadToast });
        } else {
            toast.error("Failed to save manager.", { id: loadToast });
        }
    };

    const handleBrainSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsBrainSearching(true);
        setBrainAnswer("");
        setBrainResults([]);

        try {
            const res = await fetch('/api/admin/brain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: brainQuery, community_id: brainCommunityId })
            });
            const data = await res.json();
            setBrainAnswer(data.answer || "No answer generated.");
            setBrainResults(data.sources || []);
        } catch(e) {
            toast.error("Brain search failed.");
        } finally {
            setIsBrainSearching(false);
        }
    };

    const handleMarkRead = async (id: number) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m));
        await fetch(`/api/admin/messages/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'read' }) });
        toast.success("Marked as read");
    };

    const handleDeleteMessage = async (id: number) => {
        if (!confirm('Delete message?')) return;
        setMessages(prev => prev.filter(m => m.id !== id));
        await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
        toast.success("Message deleted");
    };

    const handleDeleteDocument = async (filename: string, communityId: number) => {
        if (!confirm(`Permanently delete "${filename}"?`)) return;
        const t = toast.loading("Deleting file...");
        await fetch(`/api/admin/documents?id=${encodeURIComponent(filename)}&communityId=${communityId}`, { method: 'DELETE' });
        loadData();
        toast.success("File deleted", { id: t });
    };

    const handleClearAnalytics = async () => {
        const msg = analyticsCommId ? "Clear analytics for THIS community?" : "Clear ALL analytics data?";
        if (!confirm(msg)) return;
        try {
            const query = analyticsCommId ? `?communityId=${analyticsCommId}` : '';
            await fetch(`/api/admin/analytics${query}`, { method: 'DELETE' });
            fetchAnalytics();
            toast.success("Analytics cleared");
        } catch (e) { toast.error("Failed to clear analytics"); }
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
        toast.success("Report downloaded");
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

    // --- RENDER ---

    if (!isLoaded || loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader className="w-8 h-8 text-brand animate-spin" /></div>;

    if (isAuthorized === false) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 max-w-md w-full">
                    <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h1>
                    <p className="text-red-600 mb-6">You are logged in as: <code className="bg-red-100 px-2 py-1 rounded text-sm font-mono">{user?.primaryEmailAddress?.emailAddress}</code></p>
                    <button onClick={() => router.push('/')} className="bg-white border border-red-200 text-red-700 px-6 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors">Return Home</button>
                </div>
            </div>
        );
    }

    const filteredDocuments = selectedCommId ? documents.filter(d => d.community_id.toString() === selectedCommId) : [];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Top Navbar */}
            <div className="bg-brand-dark text-white pt-24 pb-20 px-8 relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end relative z-10">
                    <div>
                        <h1 className="text-3xl font-serif font-bold mb-2">Admin Portal</h1>
                        <p className="text-brand-accent/80">Manager Dashboard</p>
                    </div>
                    {/* Scrollable Tabs for Mobile */}
                    <div className="flex gap-2 mt-6 md:mt-0 bg-white/10 p-1 rounded-lg backdrop-blur-sm overflow-x-auto max-w-full no-scrollbar">
                         {[
                            { id: 'inbox', icon: Mail, label: 'Inbox' },
                            { id: 'communities', icon: Building2, label: 'Communities' },
                            { id: 'events', icon: Calendar, label: 'Events' },
                            { id: 'news', icon: Megaphone, label: 'News' },
                            { id: 'vendors', icon: HardHat, label: 'Vendors' },
                            { id: 'managers', icon: Users, label: 'Managers' },
                            { id: 'brain', icon: BrainCircuit, label: 'Brain' },
                            { id: 'knowledge', icon: BookOpen, label: 'Docs' }, // Shortened label
                            { id: 'analytics', icon: BarChart3, label: 'Stats' },
                        ].map((tab) => (
                             <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-300 hover:text-white'}`}
                            >
                                <tab.icon className="w-4 h-4" /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-12 relative z-20">

                {/* TAB 1: INBOX */}
                {activeTab === 'inbox' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100"><h2 className="text-lg font-bold text-slate-800">Messages</h2></div>

                        {/* DESKTOP TABLE VIEW */}
                        <table className="w-full text-left hidden md:table">
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

                        {/* MOBILE CARD VIEW */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`p-4 ${msg.status === 'new' ? 'bg-white' : 'bg-slate-50/50'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-bold text-slate-900">{msg.first_name} {msg.last_name}</div>
                                            <div className="text-xs text-slate-500">{msg.email}</div>
                                        </div>
                                        <div className="flex gap-1">
                                            {msg.status === 'new' && <button onClick={() => handleMarkRead(msg.id)} className="text-emerald-500 p-2"><CheckCircle className="w-5 h-5"/></button>}
                                            <button onClick={() => handleDeleteMessage(msg.id)} className="text-red-400 p-2"><Trash2 className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-700">{msg.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 2: COMMUNITIES */}
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
                                    <div key={c.id} className="flex flex-col md:flex-row justify-between p-4 border rounded bg-white items-start md:items-center gap-4">
                                        <div>
                                            <div className="font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                                                {c.name}
                                                {c.alert_message && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Alert Active</span>}
                                            </div>
                                            {(c.alert_start_time || c.alert_end_time) && <div className="text-[10px] text-slate-400 mt-1">Scheduled Banner</div>}
                                            <div className="text-xs text-slate-500">{c.city}</div>
                                        </div>
                                        <div className="flex items-center gap-2 self-end md:self-auto">
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
                                <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                                    <h3 className="text-xl font-bold mb-6">{editingComm.id === 0 ? 'Add Community' : 'Edit Community'}</h3>
                                    <form onSubmit={handleSaveCommunity} className="space-y-4">
                                        <input required placeholder="Name" className="w-full p-3 border rounded-lg" value={editingComm.name} onChange={e => setEditingComm({...editingComm, name: e.target.value})} />
                                        <input placeholder="City" className="w-full p-3 border rounded-lg" value={editingComm.city} onChange={e => setEditingComm({...editingComm, city: e.target.value})} />
                                        <input placeholder="Slug" className="w-full p-3 border rounded-lg" value={editingComm.slug} onChange={e => setEditingComm({...editingComm, slug: e.target.value})} required />
                                        <input required placeholder="Portal URL" className="w-full p-3 border rounded-lg" value={editingComm.portal_url} onChange={e => setEditingComm({...editingComm, portal_url: e.target.value})} />

                                        <div className="border-t pt-4 mt-2 bg-slate-50 p-4 rounded-xl">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Community Alert Banner</label>
                                            <textarea
                                                placeholder="Alert Message (e.g. 'Water shut off tomorrow'). Leave empty to disable."
                                                className="w-full p-3 border rounded-lg h-24 mb-2 text-sm"
                                                value={editingComm.alert_message || ''}
                                                onChange={e => setEditingComm({...editingComm, alert_message: e.target.value})}
                                            />
                                            <select
                                                className="w-full p-3 border rounded-lg mb-4"
                                                value={editingComm.alert_type || 'info'}
                                                onChange={e => setEditingComm({...editingComm, alert_type: e.target.value as any})}
                                            >
                                                <option value="info">Info (Blue)</option>
                                                <option value="warning">Warning (Orange)</option>
                                                <option value="emergency">Emergency (Red)</option>
                                            </select>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Start Date/Time</label>
                                                    <input type="datetime-local" className="w-full p-2 border rounded text-xs" value={editingComm.alert_start_time || ''} onChange={e => setEditingComm({...editingComm, alert_start_time: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">End Date/Time</label>
                                                    <input type="datetime-local" className="w-full p-2 border rounded text-xs" value={editingComm.alert_end_time || ''} onChange={e => setEditingComm({...editingComm, alert_end_time: e.target.value})} />
                                                </div>
                                            </div>
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

                {/* --- TAB: VENDORS --- */}
                {activeTab === 'vendors' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                         <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-800">Preferred Vendors</h2>
                            <button onClick={() => { setEditingVendor({ id: 0, name: '', specialty: '', website_url: '', active: true }); setIsVendorModalOpen(true); }} className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Add Vendor</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vendors.map(v => (
                                <div key={v.id} className="border p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <div className="font-bold">{v.name}</div>
                                        <div className="text-sm text-slate-500">{v.specialty}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingVendor(v); setIsVendorModalOpen(true); }} className="p-2 text-slate-400 hover:text-brand"><Edit2 className="w-4 h-4"/></button>
                                        <button onClick={() => handleDeleteGeneric('/api/admin/vendors', v.id, loadVendors)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                         {isVendorModalOpen && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl p-8 w-full max-w-md">
                                    <h3 className="font-bold mb-4">Edit Vendor</h3>
                                    <form onSubmit={(e) => { e.preventDefault(); handleSaveGeneric('/api/admin/vendors', editingVendor, loadVendors, setIsVendorModalOpen); }} className="space-y-3">
                                        <input className="w-full p-2 border rounded" placeholder="Name" value={editingVendor.name} onChange={e => setEditingVendor({...editingVendor, name: e.target.value})} required />
                                        <input className="w-full p-2 border rounded" placeholder="Specialty" value={editingVendor.specialty} onChange={e => setEditingVendor({...editingVendor, specialty: e.target.value})} required />
                                        <input className="w-full p-2 border rounded" placeholder="Website" value={editingVendor.website_url} onChange={e => setEditingVendor({...editingVendor, website_url: e.target.value})} />
                                        <button type="submit" className="w-full bg-brand text-white py-2 rounded font-bold">Save</button>
                                    </form>
                                    <button onClick={() => setIsVendorModalOpen(false)} className="w-full mt-2 text-slate-400">Cancel</button>
                                </div>
                            </div>
                         )}
                    </div>
                )}

                {/* --- TAB: EVENTS --- */}
                {activeTab === 'events' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                         <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-800">Community Events</h2>
                            <button onClick={() => { setEditingEvent({ id: 0, community_id: communities[0]?.id || 0, title: '', event_date: '', event_time: '', location: '' }); setIsEventModalOpen(true); }} className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Add Event</button>
                        </div>
                        <div className="space-y-2">
                             {events.map(ev => (
                                <div key={ev.id} className="border p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center bg-white gap-2">
                                    <div>
                                        <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold uppercase">{communities.find(c => c.id === ev.community_id)?.name}</span>
                                        <div className="font-bold mt-1">{ev.title}</div>
                                        <div className="text-sm text-slate-500">{ev.event_date} @ {ev.event_time}</div>
                                    </div>
                                    <button onClick={() => handleDeleteGeneric('/api/admin/events', ev.id, loadEvents)} className="text-red-400 p-2 self-end md:self-auto"><Trash2 className="w-4 h-4"/></button>
                                </div>
                             ))}
                        </div>
                        {isEventModalOpen && (
                             <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl p-8 w-full max-w-md">
                                    <h3 className="font-bold mb-4">Add Event</h3>
                                    <form onSubmit={(e) => { e.preventDefault(); handleSaveGeneric('/api/admin/events', editingEvent, loadEvents, setIsEventModalOpen); }} className="space-y-3">
                                        <select className="w-full p-2 border rounded" value={editingEvent.community_id} onChange={e => setEditingEvent({...editingEvent, community_id: parseInt(e.target.value)})}>
                                            {communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <input className="w-full p-2 border rounded" placeholder="Event Title" value={editingEvent.title} onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} required />
                                        <input type="date" className="w-full p-2 border rounded" value={editingEvent.event_date} onChange={e => setEditingEvent({...editingEvent, event_date: e.target.value})} required />
                                        <input type="time" className="w-full p-2 border rounded" value={editingEvent.event_time} onChange={e => setEditingEvent({...editingEvent, event_time: e.target.value})} required />
                                        <input className="w-full p-2 border rounded" placeholder="Location" value={editingEvent.location} onChange={e => setEditingEvent({...editingEvent, location: e.target.value})} />
                                        <button type="submit" className="w-full bg-brand text-white py-2 rounded font-bold">Save Event</button>
                                    </form>
                                     <button onClick={() => setIsEventModalOpen(false)} className="w-full mt-2 text-slate-400">Cancel</button>
                                </div>
                             </div>
                        )}
                    </div>
                )}

                 {/* --- TAB: NEWS --- */}
                {activeTab === 'news' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-800">News & Announcements</h2>
                            <button onClick={() => { setEditingNews({ id: 0, community_id: communities[0]?.id || 0, title: '', content: '', created_at: '' }); setIsNewsModalOpen(true); }} className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Post News</button>
                        </div>
                        <div className="space-y-4">
                            {news.map(n => (
                                <div key={n.id} className="border p-4 rounded-lg bg-white">
                                    <div className="flex justify-between">
                                        <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold uppercase">{communities.find(c => c.id === n.community_id)?.name}</span>
                                        <button onClick={() => handleDeleteGeneric('/api/admin/news', n.id, loadNews)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                    <h3 className="font-bold mt-2">{n.title}</h3>
                                    <p className="text-sm text-slate-600 line-clamp-2">{n.content}</p>
                                </div>
                            ))}
                        </div>
                         {isNewsModalOpen && (
                             <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
                                    <h3 className="font-bold mb-4">Post Announcement</h3>
                                    <form onSubmit={(e) => { e.preventDefault(); handleSaveGeneric('/api/admin/news', editingNews, loadNews, setIsNewsModalOpen); }} className="space-y-3">
                                        <select className="w-full p-2 border rounded" value={editingNews.community_id} onChange={e => setEditingNews({...editingNews, community_id: parseInt(e.target.value)})}>
                                            {communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <input className="w-full p-2 border rounded font-bold" placeholder="Headline" value={editingNews.title} onChange={e => setEditingNews({...editingNews, title: e.target.value})} required />
                                        <textarea className="w-full p-2 border rounded h-32" placeholder="Content..." value={editingNews.content} onChange={e => setEditingNews({...editingNews, content: e.target.value})} required />
                                        <button type="submit" className="w-full bg-brand text-white py-2 rounded font-bold">Publish Post</button>
                                    </form>
                                     <button onClick={() => setIsNewsModalOpen(false)} className="w-full mt-2 text-slate-400">Cancel</button>
                                </div>
                             </div>
                        )}
                    </div>
                )}

                {/* TAB 4: BRAIN SEARCH (UPDATED WITH RAG) */}
                {activeTab === 'brain' && (
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

                        <form onSubmit={handleBrainSearch} className="max-w-3xl mx-auto mb-12 relative">
                             {/* UPDATED: Context Dropdown */}
                             <div className="mb-4 flex justify-center">
                                <select
                                    className="p-2 border rounded-lg text-sm bg-slate-50 font-medium text-slate-600"
                                    value={brainCommunityId}
                                    onChange={(e) => setBrainCommunityId(e.target.value)}
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
                            </div>
                        </form>

                        <div className="max-w-4xl mx-auto space-y-8">

                            {/* AI ANSWER SECTION */}
                            {brainAnswer && (
                                <div className="bg-blue-50/50 p-8 rounded-2xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                    <h3 className="font-bold text-brand-dark flex items-center gap-2 mb-4">
                                        <Bot className="w-5 h-5" /> AI Answer
                                    </h3>
                                    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
                                        {brainAnswer}
                                    </div>
                                </div>
                            )}

                            {/* SOURCES SECTION */}
                            {brainResults.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-slate-400 uppercase tracking-wider text-xs mb-4 ml-1">Sources Cited</h3>
                                    <div className="grid gap-3">
                                        {brainResults.map((result, i) => (
                                            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-brand/30 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold text-slate-600 uppercase">
                                                        {result.community_name}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-mono">{result.filename}</span>
                                                </div>
                                                <p className="text-slate-500 text-xs line-clamp-2 italic">
                                                    "...{result.content.substring(0, 150)}..."
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {brainResults.length === 0 && !isBrainSearching && brainQuery && !brainAnswer && (
                                <div className="text-center text-slate-400 py-10">No relevant documents found.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 5: KNOWLEDGE */}
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
                                <>
                                    {/* DESKTOP TABLE */}
                                    <table className="w-full text-left hidden md:table">
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

                                    {/* MOBILE CARD VIEW */}
                                    <div className="md:hidden divide-y divide-slate-100">
                                        {filteredDocuments.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400 italic">No documents found.</div>
                                        ) : (
                                            filteredDocuments.map((doc, idx) => (
                                                <div key={doc.id + idx} className="p-4 flex justify-between items-center">
                                                    <div className="overflow-hidden">
                                                        <div className="font-bold text-slate-800 flex items-center gap-2 truncate">
                                                            <FileText className="w-4 h-4 text-brand-accent flex-shrink-0" />
                                                            <span className="truncate">{doc.filename}</span>
                                                        </div>
                                                        <div className="mt-1">
                                                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                                {doc.chunk_count} chunks
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteDocument(doc.filename, doc.community_id)}
                                                        className="text-slate-300 hover:text-red-500 p-2"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
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

                {/* TAB 6: ANALYTICS */}
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
                                        {/* DESKTOP TABLE */}
                                        <table className="w-full text-left hidden md:table">
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

                                        {/* MOBILE LIST VIEW */}
                                        <div className="md:hidden divide-y divide-slate-100">
                                            {analytics.feed.length === 0 ? (
                                                <div className="p-8 text-center text-slate-400">No activity recorded yet.</div>
                                            ) : (
                                                analytics.feed.map((item) => (
                                                    <div key={item.id} className="p-4">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="font-bold text-slate-800 text-sm">{item.community_name}</span>
                                                            <span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 mb-2">{item.topic}</p>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                            item.category === 'Complaint' ? 'bg-red-50 text-red-700 ring-1 ring-red-600/10' :
                                                                item.category === 'Maintenance' ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/10' :
                                                                    'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10'
                                                        }`}>
                                                            {item.category}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
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