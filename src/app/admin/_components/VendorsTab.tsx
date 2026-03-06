"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Vendor } from './types';

const empty: Vendor = { id: 0, name: '', specialty: '', website_url: '', active: true };

export default function VendorsTab() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Vendor>(empty);

    const load = () => fetch('/api/admin/vendors').then(r => r.json()).then(setVendors).catch(() => setVendors([]));
    useEffect(() => { load(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editing.id === 0 ? 'POST' : 'PUT';
        const loadToast = toast.loading("Saving...");
        const res = await fetch('/api/admin/vendors', {
            method,
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
        const res = await fetch(`/api/admin/vendors?id=${id}`, { method: 'DELETE' });
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
                <h2 className="text-lg font-bold text-slate-800">Preferred Vendors</h2>
                <button
                    onClick={() => { setEditing(empty); setIsModalOpen(true); }}
                    className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Vendor
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendors.map(v => (
                    <div key={v.id} className="border p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <div className="font-bold">{v.name}</div>
                            <div className="text-sm text-slate-500">{v.specialty}</div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditing(v); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-brand">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-400 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md">
                        <h3 className="font-bold mb-4">Edit Vendor</h3>
                        <form onSubmit={handleSave} className="space-y-3">
                            <input className="w-full p-2 border rounded" placeholder="Name" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} required />
                            <input className="w-full p-2 border rounded" placeholder="Specialty" value={editing.specialty} onChange={e => setEditing({ ...editing, specialty: e.target.value })} required />
                            <input className="w-full p-2 border rounded" placeholder="Website" value={editing.website_url} onChange={e => setEditing({ ...editing, website_url: e.target.value })} />
                            <button type="submit" className="w-full bg-brand text-white py-2 rounded font-bold">Save</button>
                        </form>
                        <button onClick={() => setIsModalOpen(false)} className="w-full mt-2 text-slate-400">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}
