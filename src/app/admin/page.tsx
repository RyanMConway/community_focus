"use client";

import { useEffect, useState } from 'react';
import { Mail, Building2, Trash2, CheckCircle, Plus, BookOpen, Upload, FileText, Loader, Filter } from 'lucide-react';

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
}

interface Document {
    id: string;
    filename: string;
    community_id: number; // Added for filtering
    community_name: string;
    chunk_count: number;
    created_at: string;
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'inbox' | 'communities' | 'knowledge'>('inbox');

    // Data State
    const [messages, setMessages] = useState<Message[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State for New Community
    const [isAdding, setIsAdding] = useState(false);
    const [newComm, setNewComm] = useState({ name: '', city: 'Durham, NC', portal_url: '', description: '' });

    // Form State for Document Upload
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");
    const [selectedCommId, setSelectedCommId] = useState<string>(""); // Acts as Upload Target AND Filter
    const [files, setFiles] = useState<FileList | null>(null);

    // --- INITIAL LOAD ---
    useEffect(() => {
        loadData();
    }, []);

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

    // --- COMMUNITY ACTIONS ---
    const handleAddCommunity = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/admin/communities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newComm)
        });

        if (res.ok) {
            loadData();
            setIsAdding(false);
            setNewComm({ name: '', city: 'Durham, NC', portal_url: '', description: '' });
        }
    };

    const handleDeleteCommunity = async (id: number) => {
        if (!confirm('Delete this community? This cannot be undone.')) return;
        await fetch(`/api/admin/communities?id=${id}`, { method: 'DELETE' });
        setCommunities(prev => prev.filter(c => c.id !== id));
    };

    // --- MESSAGE ACTIONS ---
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

    // --- DOCUMENT ACTIONS ---
    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files || files.length === 0 || !selectedCommId) return;

        setUploading(true);
        const fileArray = Array.from(files);
        let errors = [];

        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            setUploadProgress(`Uploading ${i + 1} of ${fileArray.length}: ${file.name}`);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('communityId', selectedCommId);

            try {
                const res = await fetch('/api/admin/documents', {
                    method: 'POST',
                    body: formData
                });
                if (!res.ok) {
                    const err = await res.json();
                    errors.push(`${file.name}: ${err.error}`);
                }
            } catch (err) {
                errors.push(`${file.name}: Upload failed`);
            }

            if (i < fileArray.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        setUploading(false);
        setUploadProgress("");
        setFiles(null);

        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        if (errors.length > 0) {
            alert(`Some files failed:\n${errors.join('\n')}`);
        } else {
            alert('All documents uploaded successfully!');
        }

        loadData();
    };

    const handleDeleteDocument = async (filename: string) => {
        if (!confirm(`Delete "${filename}" and all its knowledge?`)) return;
        await fetch(`/api/admin/documents?id=${encodeURIComponent(filename)}`, { method: 'DELETE' });
        loadData();
    };

    // --- FILTERED DOCS LOGIC ---
    const filteredDocuments = selectedCommId
        ? documents.filter(d => d.community_id.toString() === selectedCommId)
        : [];

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
                    <div className="flex gap-2 mt-6 md:mt-0 bg-white/10 p-1 rounded-lg backdrop-blur-sm">
                        <button onClick={() => setActiveTab('inbox')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'inbox' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-300 hover:text-white'}`}>
                            <Mail className="w-4 h-4" /> Inbox
                        </button>
                        <button onClick={() => setActiveTab('communities')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'communities' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-300 hover:text-white'}`}>
                            <Building2 className="w-4 h-4" /> Communities
                        </button>
                        <button onClick={() => setActiveTab('knowledge')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'knowledge' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-300 hover:text-white'}`}>
                            <BookOpen className="w-4 h-4" /> Knowledge Base
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-12 relative z-20">

                {/* === TAB 1: INBOX === */}
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

                {/* === TAB 2: COMMUNITIES === */}
                {activeTab === 'communities' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-slate-800">Manage Communities</h2>
                                <button onClick={() => setIsAdding(!isAdding)} className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
                                    <Plus className="w-4 h-4" /> {isAdding ? 'Cancel' : 'Add New'}
                                </button>
                            </div>
                            {isAdding && (
                                <form onSubmit={handleAddCommunity} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input required placeholder="Name" className="p-2 rounded border" value={newComm.name} onChange={e => setNewComm({...newComm, name: e.target.value})} />
                                        <input placeholder="City" className="p-2 rounded border" value={newComm.city} onChange={e => setNewComm({...newComm, city: e.target.value})} />
                                        <input required placeholder="Portal URL" className="p-2 rounded border md:col-span-2" value={newComm.portal_url} onChange={e => setNewComm({...newComm, portal_url: e.target.value})} />
                                    </div>
                                    <button className="bg-brand-dark text-white px-6 py-2 rounded-lg font-bold">Save</button>
                                </form>
                            )}
                            <div className="grid gap-4">
                                {communities.map((c) => (
                                    <div key={c.id} className="flex justify-between p-4 border rounded bg-white items-center">
                                        <div>
                                            <div className="font-bold text-slate-800">{c.name}</div>
                                            <div className="text-xs text-slate-500">{c.city}</div>
                                        </div>
                                        <button onClick={() => handleDeleteCommunity(c.id)} className="text-red-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* === TAB 3: KNOWLEDGE BASE === */}
                {activeTab === 'knowledge' && (
                    <div className="space-y-6">
                        {/* Upload & Select Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-1">Knowledge Base Manager</h2>
                            <p className="text-sm text-slate-500 mb-6">Select a community to view active files or upload new ones.</p>

                            <form onSubmit={handleUpload} className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300 flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Community (Filter)</label>
                                    <select
                                        required
                                        className="w-full p-2.5 rounded border border-slate-300 bg-white"
                                        value={selectedCommId}
                                        onChange={(e) => setSelectedCommId(e.target.value)}
                                    >
                                        <option value="">-- Choose a Community --</option>
                                        {communities.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload New Files</label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        multiple
                                        accept=".pdf,.txt,.md"
                                        onChange={(e) => setFiles(e.target.files)}
                                        className="w-full bg-white border border-slate-300 rounded p-2 text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand file:text-white hover:file:bg-brand-dark"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={uploading || !files}
                                    className="bg-brand text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-brand-dark disabled:opacity-50 flex items-center gap-2 min-w-[160px] justify-center"
                                >
                                    {uploading ? (
                                        <><Loader className="w-4 h-4 animate-spin"/> {uploadProgress || 'Processing'}</>
                                    ) : (
                                        <><Upload className="w-4 h-4"/> Upload</>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Document List */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-800">
                                    {selectedCommId
                                        ? `Active Files for ${communities.find(c => c.id.toString() === selectedCommId)?.name}`
                                        : "Active Files"}
                                </h2>
                                <span className="text-xs text-slate-400">
                                    {selectedCommId ? `${filteredDocuments.length} document(s)` : "Select a community above"}
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
                                                        onClick={() => handleDeleteDocument(doc.filename)}
                                                        className="text-slate-300 hover:text-red-500 p-2 transition-colors"
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
            </div>
        </div>
    );
}