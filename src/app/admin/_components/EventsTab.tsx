"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Event, Community } from './types';

interface Props {
    communities: Community[];
}

export default function EventsTab({ communities }: Props) {
    const [events, setEvents] = useState<Event[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Event>({ id: 0, community_id: 0, title: '', event_date: '', event_time: '', location: '' });

    const load = () => fetch('/api/admin/events').then(r => r.json()).then(setEvents).catch(() => setEvents([]));
    useEffect(() => { load(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const loadToast = toast.loading("Saving...");
        const res = await fetch('/api/admin/events', {
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
        const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' });
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
                <h2 className="text-lg font-bold text-slate-800">Community Events</h2>
                <button
                    onClick={() => {
                        setEditing({ id: 0, community_id: communities[0]?.id || 0, title: '', event_date: '', event_time: '', location: '' });
                        setIsModalOpen(true);
                    }}
                    className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Event
                </button>
            </div>

            <div className="space-y-2">
                {events.map(ev => (
                    <div key={ev.id} className="border p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center bg-white gap-2">
                        <div>
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold uppercase">
                                {communities.find(c => c.id === ev.community_id)?.name}
                            </span>
                            <div className="font-bold mt-1">{ev.title}</div>
                            <div className="text-sm text-slate-500">{ev.event_date} @ {ev.event_time}</div>
                        </div>
                        <button onClick={() => handleDelete(ev.id)} className="text-red-400 p-2 self-end md:self-auto">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md">
                        <h3 className="font-bold mb-4">Add Event</h3>
                        <form onSubmit={handleSave} className="space-y-3">
                            <select className="w-full p-2 border rounded" value={editing.community_id} onChange={e => setEditing({ ...editing, community_id: parseInt(e.target.value) })}>
                                {communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <input className="w-full p-2 border rounded" placeholder="Event Title" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} required />
                            <input type="date" className="w-full p-2 border rounded" value={editing.event_date} onChange={e => setEditing({ ...editing, event_date: e.target.value })} required />
                            <input type="time" className="w-full p-2 border rounded" value={editing.event_time} onChange={e => setEditing({ ...editing, event_time: e.target.value })} required />
                            <input className="w-full p-2 border rounded" placeholder="Location" value={editing.location} onChange={e => setEditing({ ...editing, location: e.target.value })} />
                            <button type="submit" className="w-full bg-brand text-white py-2 rounded font-bold">Save Event</button>
                        </form>
                        <button onClick={() => setIsModalOpen(false)} className="w-full mt-2 text-slate-400">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}
