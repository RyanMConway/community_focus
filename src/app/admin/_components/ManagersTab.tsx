"use client";

import { useState } from 'react';
import { Plus, Mail, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Manager, Community } from './types';

interface Props {
    managers: Manager[];
    communities: Community[];
    onRefresh: () => void;
}

export default function ManagersTab({ managers, communities, onRefresh }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Manager | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        const method = editing.id === 0 ? 'POST' : 'PUT';
        const form = e.target as HTMLFormElement;
        const selectedCommIds = Array.from(form.elements)
            .filter((el: Element) => (el as HTMLInputElement).name === 'communities' && (el as HTMLInputElement).checked)
            .map((el: Element) => parseInt((el as HTMLInputElement).value));
        const payload = { ...editing, community_ids: selectedCommIds };

        const loadToast = toast.loading("Saving manager...");
        const res = await fetch('/api/admin/managers', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            onRefresh();
            setIsModalOpen(false);
            setEditing(null);
            toast.success("Manager saved!", { id: loadToast });
        } else {
            toast.error("Failed to save manager.", { id: loadToast });
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Community Managers</h2>
                    <button
                        onClick={() => { setEditing({ id: 0, name: '', email: '', phone: '', communities: [] }); setIsModalOpen(true); }}
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
                                    onClick={() => { setEditing(m); setIsModalOpen(true); }}
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

            {isModalOpen && editing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl">
                        <h3 className="text-xl font-bold mb-6">{editing.id === 0 ? 'Add Manager' : 'Edit Manager'}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <input
                                placeholder="Full Name"
                                className="w-full p-3 border rounded-lg"
                                value={editing.name}
                                onChange={e => setEditing({ ...editing, name: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    placeholder="Email"
                                    className="w-full p-3 border rounded-lg"
                                    value={editing.email}
                                    onChange={e => setEditing({ ...editing, email: e.target.value })}
                                />
                                <input
                                    placeholder="Phone"
                                    className="w-full p-3 border rounded-lg"
                                    value={editing.phone}
                                    onChange={e => setEditing({ ...editing, phone: e.target.value })}
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
                                                defaultChecked={editing.communities.some(mc => mc.id === c.id)}
                                                className="w-4 h-4 text-brand rounded"
                                            />
                                            <span className="text-sm text-slate-700">{c.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
