"use client";

import { useState, useEffect } from 'react';
import { Filter, FileText, Trash2, Loader, MessageSquare, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Community, AnalyticsData } from './types';

interface Props {
    communities: Community[];
}

function SimpleBarChart({ data, total }: { data: { label: string; value: number; color?: string }[]; total: number }) {
    return (
        <div className="space-y-3">
            {data.map((item, i) => (
                <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="text-slate-500">{item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className={`h-2.5 rounded-full ${item.color || 'bg-brand'}`} style={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%` }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function AnalyticsTab({ communities }: Props) {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [commId, setCommId] = useState<string>("");

    const fetchAnalytics = async () => {
        try {
            const query = commId ? `?range=30d&communityId=${commId}` : '?range=30d';
            const res = await fetch(`/api/admin/analytics${query}`);
            const data = await res.json();
            setAnalytics(data);
        } catch {
            console.error("Analytics fetch failed");
        }
    };

    useEffect(() => { fetchAnalytics(); }, [commId]);

    const handleClear = async () => {
        const msg = commId ? "Clear analytics for THIS community?" : "Clear ALL analytics data?";
        if (!confirm(msg)) return;
        try {
            const query = commId ? `?communityId=${commId}` : '';
            await fetch(`/api/admin/analytics${query}`, { method: 'DELETE' });
            fetchAnalytics();
            toast.success("Analytics cleared");
        } catch {
            toast.error("Failed to clear analytics");
        }
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="w-full md:w-1/3">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Filter Stats by Community</label>
                    <div className="relative">
                        <select
                            className="w-full p-3 rounded-lg border border-slate-300 bg-white appearance-none cursor-pointer hover:border-brand/50 focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                            value={commId}
                            onChange={(e) => setCommId(e.target.value)}
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
                    <button onClick={handleExportCSV} className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-brand px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Export CSV
                    </button>
                    <button onClick={handleClear} className="text-red-400 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> {commId ? "Clear Community" : "Clear History"}
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
                                <div className="p-2 bg-blue-50 text-brand rounded-lg"><MessageSquare className="w-5 h-5" /></div>
                                <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide">Total Queries (30d)</h3>
                            </div>
                            <p className="text-4xl font-bold text-slate-800">{analytics.total}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><AlertCircle className="w-5 h-5" /></div>
                                <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide">Top Issue</h3>
                            </div>
                            <p className="text-2xl font-bold text-slate-800 truncate">{analytics.topics[0]?.topic || "N/A"}</p>
                            <p className="text-xs text-slate-400 mt-1">Most frequent topic detected</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
                                <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide">Top Category</h3>
                            </div>
                            <p className="text-2xl font-bold text-slate-800 truncate">{analytics.categories[0]?.category || "N/A"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Inquiry Categories</h3>
                            {analytics.categories.length === 0 ? <p className="text-slate-400 text-sm">No data yet.</p> : (
                                <SimpleBarChart
                                    total={analytics.total}
                                    data={analytics.categories.map(c => ({
                                        label: c.category,
                                        value: parseInt(c.count as unknown as string),
                                        color: c.category === 'Complaint' ? 'bg-red-500' : c.category === 'Maintenance' ? 'bg-orange-500' : 'bg-brand'
                                    }))}
                                />
                            )}
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Top Specific Topics</h3>
                            {analytics.topics.length === 0 ? <p className="text-slate-400 text-sm">No data yet.</p> : (
                                <div className="space-y-4">
                                    {analytics.topics.map((t, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-slate-400 text-sm w-4">#{i + 1}</span>
                                                <span className="font-bold text-slate-700">{t.topic}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${t.category === 'Complaint' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
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

                    {/* Live Feed */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Recent Live Activity</h3>
                            <button onClick={fetchAnalytics} className="text-slate-400 hover:text-brand"><RefreshCw className="w-4 h-4" /></button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
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
                                                    {new Date(item.created_at).toLocaleDateString()} <span className="text-xs opacity-70">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </td>
                                                <td className="px-6 py-3 text-sm font-medium text-slate-700">{item.community_name}</td>
                                                <td className="px-6 py-3 text-sm text-slate-600">{item.topic}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.category === 'Complaint' ? 'bg-red-50 text-red-700 ring-1 ring-red-600/10' : item.category === 'Maintenance' ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/10' : 'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10'}`}>
                                                        {item.category}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
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
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.category === 'Complaint' ? 'bg-red-50 text-red-700 ring-1 ring-red-600/10' : item.category === 'Maintenance' ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/10' : 'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10'}`}>
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
    );
}
