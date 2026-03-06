"use client";

import { CheckCircle, Trash2 } from 'lucide-react';
import { Message } from './types';

interface Props {
    messages: Message[];
    onMarkRead: (id: number) => void;
    onDelete: (id: number) => void;
}

export default function InboxTab({ messages, onMarkRead, onDelete }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Messages</h2>
            </div>

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
                                {msg.status === 'new' && (
                                    <button onClick={() => onMarkRead(msg.id)} className="text-emerald-500 hover:bg-emerald-50 p-2 rounded">
                                        <CheckCircle className="w-5 h-5" />
                                    </button>
                                )}
                                <button onClick={() => onDelete(msg.id)} className="text-red-400 hover:bg-red-50 p-2 rounded">
                                    <Trash2 className="w-5 h-5" />
                                </button>
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
                                {msg.status === 'new' && (
                                    <button onClick={() => onMarkRead(msg.id)} className="text-emerald-500 p-2">
                                        <CheckCircle className="w-5 h-5" />
                                    </button>
                                )}
                                <button onClick={() => onDelete(msg.id)} className="text-red-400 p-2">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-slate-700">{msg.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
