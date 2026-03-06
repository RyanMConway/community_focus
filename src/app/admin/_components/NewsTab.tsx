"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { NewsPost, Community } from './types';

interface Props {
    communities: Community[];
}

export default function NewsTab({ communities }: Props) {
    const [news, setNews] = useState<NewsPost[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<NewsPost>({ id: 0, community_id: 0, title: '', content: '', created_at: '' });

    const load = () => fetch('/api/admin/news').then(r => r.json()).then(setNews).catch(() => setNews([]));
    useEffect(() => { load(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const loadToast = toast.loading("Saving...");
        const res = await fetch('/api/admin/news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editing)
        });
        if (res.ok) {
            load();
            setIsModalOpen(false);
            toast.success("Saved successfully!", { id: loadToast });
        } else {
            toast.error("Failed to save.", { id: loadToast });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        const loadToast = toast.loading("Deleting...");
        const res = await fetch(`/api/admin/news?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            load();
            toast.success("Deleted!", { id: loadToast });
        } else {
            toast.error("Failed to delete.", { id: loadToast });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">News & Announcements</h2>
                <button
                    onClick={() => {
                        setEditing({ id: 0, community_id: communities[0]?.id || 0, title: '', content: '', created_at: '' });
                        setIsModalOpen(true);
                    }}
                    className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Post News
                </button>
            </div>

            <div className="space-y-4">
                {news.map(n => (
                    <div key={n.id} className="border p-4 rounded-lg bg-white">
                        <div className="flex justify-between">
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold uppercase">
                                {communities.find(c => c.id === n.community_id)?.name}
                            </span>
                            <button onClick={() => handleDelete(n.id)} className="text-red-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <h3 className="font-bold mt-2">{n.title}</h3>
                        <p className="text-sm text-slate-600 line-clamp-2">{n.content}</p>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
                        <h3 className="font-bold mb-4">Post Announcement</h3>
                        <form onSubmit={handleSave} className="space-y-3">
                            <select className="w-full p-2 border rounded" value={editing.community_id} onChange={e => setEditing({ ...editing, community_id: parseInt(e.target.value) })}>
                                {communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <input className="w-full p-2 border rounded font-bold" placeholder="Headline" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} required />
                            <textarea className="w-full p-2 border rounded h-32" placeholder="Content..." value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })} required />
                            <button type="submit" className="w-full bg-brand text-white py-2 rounded font-bold">Publish Post</button>
                        </form>
                        <button onClick={() => setIsModalOpen(false)} className="w-full mt-2 text-slate-400">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}
