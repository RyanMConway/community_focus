"use client";

import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Community } from './types';

interface Props {
    communities: Community[];
    onRefresh: () => void;
}

const empty: Community = {
    id: 0, name: '', city: 'Durham, NC', portal_url: '', slug: '',
    alert_message: '', alert_type: 'info', alert_start_time: '', alert_end_time: ''
};

export default function CommunitiesTab({ communities, onRefresh }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Community>(empty);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editing.id === 0 ? 'POST' : 'PUT';
        const loadToast = toast.loading("Saving community...");
        const res = await fetch('/api/admin/communities', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editing)
        });
        if (res.ok) {
            onRefresh();
            setIsModalOpen(false);
            toast.success("Community saved!", { id: loadToast });
        } else {
            toast.error("Failed to save community.", { id: loadToast });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this community? This cannot be undone.')) return;
        await fetch(`/api/admin/communities?id=${id}`, { method: 'DELETE' });
        onRefresh();
        toast.success("Community deleted.");
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Manage Communities</h2>
                    <button
                        onClick={() => { setEditing(empty); setIsModalOpen(true); }}
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
                                    {c.alert_message && (
                                        <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Alert Active</span>
                                    )}
                                </div>
                                {(c.alert_start_time || c.alert_end_time) && (
                                    <div className="text-[10px] text-slate-400 mt-1">Scheduled Banner</div>
                                )}
                                <div className="text-xs text-slate-500">{c.city}</div>
                            </div>
                            <div className="flex items-center gap-2 self-end md:self-auto">
                                <button
                                    onClick={() => { setEditing(c); setIsModalOpen(true); }}
                                    className="text-brand hover:bg-blue-50 p-2 rounded transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(c.id)}
                                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-6">{editing.id === 0 ? 'Add Community' : 'Edit Community'}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <input required placeholder="Name" className="w-full p-3 border rounded-lg" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                            <input placeholder="City" className="w-full p-3 border rounded-lg" value={editing.city} onChange={e => setEditing({ ...editing, city: e.target.value })} />
                            <input placeholder="Slug" className="w-full p-3 border rounded-lg" value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} required />
                            <input required placeholder="Portal URL" className="w-full p-3 border rounded-lg" value={editing.portal_url} onChange={e => setEditing({ ...editing, portal_url: e.target.value })} />

                            <div className="border-t pt-4 mt-2 bg-slate-50 p-4 rounded-xl">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Community Alert Banner</label>
                                <textarea
                                    placeholder="Alert Message (e.g. 'Water shut off tomorrow'). Leave empty to disable."
                                    className="w-full p-3 border rounded-lg h-24 mb-2 text-sm"
                                    value={editing.alert_message || ''}
                                    onChange={e => setEditing({ ...editing, alert_message: e.target.value })}
                                />
                                <select
                                    className="w-full p-3 border rounded-lg mb-4"
                                    value={editing.alert_type || 'info'}
                                    onChange={e => setEditing({ ...editing, alert_type: e.target.value as Community['alert_type'] })}
                                >
                                    <option value="info">Info (Blue)</option>
                                    <option value="warning">Warning (Orange)</option>
                                    <option value="emergency">Emergency (Red)</option>
                                </select>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Start Date/Time</label>
                                        <input type="datetime-local" className="w-full p-2 border rounded text-xs" value={editing.alert_start_time || ''} onChange={e => setEditing({ ...editing, alert_start_time: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">End Date/Time</label>
                                        <input type="datetime-local" className="w-full p-2 border rounded text-xs" value={editing.alert_end_time || ''} onChange={e => setEditing({ ...editing, alert_end_time: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
