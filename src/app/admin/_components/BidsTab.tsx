"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ChevronDown, ChevronUp, Mail, Phone, Clock, Building2, Users } from 'lucide-react';
import { BidRequest } from './types';

const STATUS_STYLES: Record<string, string> = {
    new:       'bg-blue-100 text-blue-700 ring-1 ring-blue-600/20',
    contacted: 'bg-amber-100 text-amber-700 ring-1 ring-amber-600/20',
    won:       'bg-green-100 text-green-700 ring-1 ring-green-600/20',
    lost:      'bg-slate-100 text-slate-500 ring-1 ring-slate-400/20',
};

const STATUS_OPTIONS = ['new', 'contacted', 'won', 'lost'];

export default function BidsTab() {
    const [bids, setBids] = useState<BidRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);

    const load = () => {
        fetch('/api/admin/bids').then(r => r.json()).then(data => {
            setBids(data || []);
            setLoading(false);
        });
    };

    useEffect(() => { load(); }, []);

    const handleStatusChange = async (id: number, status: string) => {
        setBids(prev => prev.map(b => b.id === id ? { ...b, status: status as BidRequest['status'] } : b));
        const res = await fetch(`/api/admin/bids?id=${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (res.ok) toast.success('Status updated');
        else toast.error('Failed to update status');
    };

    const counts = STATUS_OPTIONS.reduce((acc, s) => ({
        ...acc, [s]: bids.filter(b => b.status === s).length
    }), {} as Record<string, number>);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {STATUS_OPTIONS.map(s => (
                    <div key={s} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                        <p className="text-xs font-bold uppercase text-slate-400 mb-1">{s}</p>
                        <p className="text-3xl font-bold text-slate-800">{counts[s] ?? 0}</p>
                        <span className={`inline-flex mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLES[s]}`}>{s}</span>
                    </div>
                ))}
            </div>

            {/* Bids Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Proposal Requests</h2>
                    <span className="text-xs text-slate-400">{bids.length} total</span>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-400">Loading...</div>
                ) : bids.length === 0 ? (
                    <div className="p-12 text-center">
                        <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">No proposals yet</p>
                        <p className="text-slate-400 text-sm">Submissions from /get-proposal will appear here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {bids.map(bid => (
                            <div key={bid.id} className="hover:bg-slate-50/50 transition-colors">
                                {/* Row Summary */}
                                <div
                                    className="p-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer"
                                    onClick={() => setExpanded(expanded === bid.id ? null : bid.id)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="font-bold text-slate-800 truncate">{bid.community_name}</h3>
                                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{bid.association_type}</span>
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLES[bid.status]}`}>
                                                {bid.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {bid.unit_count} units · {bid.city}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {bid.timeline}</span>
                                            <span>{bid.contact_name} · {bid.contact_role}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <select
                                            value={bid.status}
                                            onChange={e => { e.stopPropagation(); handleStatusChange(bid.id, e.target.value); }}
                                            onClick={e => e.stopPropagation()}
                                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/20"
                                        >
                                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                        </select>
                                        {expanded === bid.id
                                            ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                            : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        }
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expanded === bid.id && (
                                    <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-5 bg-slate-50/50">
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase">Community Details</h4>
                                            <dl className="space-y-1.5 text-sm">
                                                <div className="flex gap-2"><dt className="text-slate-400 w-32 flex-shrink-0">Type</dt><dd className="text-slate-700 font-medium">{bid.association_type}</dd></div>
                                                <div className="flex gap-2"><dt className="text-slate-400 w-32 flex-shrink-0">Units</dt><dd className="text-slate-700 font-medium">{bid.unit_count}</dd></div>
                                                <div className="flex gap-2"><dt className="text-slate-400 w-32 flex-shrink-0">City</dt><dd className="text-slate-700 font-medium">{bid.city}</dd></div>
                                                <div className="flex gap-2"><dt className="text-slate-400 w-32 flex-shrink-0">Situation</dt><dd className="text-slate-700 font-medium">{bid.current_situation}</dd></div>
                                                <div className="flex gap-2"><dt className="text-slate-400 w-32 flex-shrink-0">Timeline</dt><dd className="text-slate-700 font-medium">{bid.timeline}</dd></div>
                                                <div className="flex gap-2"><dt className="text-slate-400 w-32 flex-shrink-0">Services</dt><dd className="text-slate-700 font-medium">{bid.services_needed.join(', ')}</dd></div>
                                                {bid.biggest_challenge && (
                                                    <div className="flex gap-2"><dt className="text-slate-400 w-32 flex-shrink-0">Challenge</dt><dd className="text-slate-700 font-medium italic">"{bid.biggest_challenge}"</dd></div>
                                                )}
                                            </dl>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase">Contact</h4>
                                            <dl className="space-y-1.5 text-sm">
                                                <div className="flex gap-2"><dt className="text-slate-400 w-24 flex-shrink-0">Name</dt><dd className="text-slate-700 font-medium">{bid.contact_name}</dd></div>
                                                <div className="flex gap-2"><dt className="text-slate-400 w-24 flex-shrink-0">Role</dt><dd className="text-slate-700 font-medium">{bid.contact_role}</dd></div>
                                                <div className="flex gap-2 items-center"><dt className="text-slate-400 w-24 flex-shrink-0">Email</dt>
                                                    <dd><a href={`mailto:${bid.contact_email}`} className="text-brand hover:underline font-medium flex items-center gap-1"><Mail className="w-3 h-3" />{bid.contact_email}</a></dd>
                                                </div>
                                                <div className="flex gap-2 items-center"><dt className="text-slate-400 w-24 flex-shrink-0">Phone</dt>
                                                    <dd><a href={`tel:${bid.contact_phone}`} className="text-brand hover:underline font-medium flex items-center gap-1"><Phone className="w-3 h-3" />{bid.contact_phone}</a></dd>
                                                </div>
                                                <div className="flex gap-2"><dt className="text-slate-400 w-24 flex-shrink-0">Best Time</dt><dd className="text-slate-700 font-medium">{bid.best_time}</dd></div>
                                                <div className="flex gap-2"><dt className="text-slate-400 w-24 flex-shrink-0">Received</dt><dd className="text-slate-500 text-xs">{new Date(bid.created_at).toLocaleDateString()} {new Date(bid.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</dd></div>
                                            </dl>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
