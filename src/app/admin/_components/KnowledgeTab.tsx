"use client";

import { useState } from 'react';
import { Upload, Filter, FileText, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Community, Document } from './types';

interface Props {
    communities: Community[];
    documents: Document[];
    onDeleteDocument: (filename: string, communityId: number) => void;
}

export default function KnowledgeTab({ communities, documents, onDeleteDocument }: Props) {
    const router = useRouter();
    const [selectedCommId, setSelectedCommId] = useState<string>("");

    const filteredDocuments = selectedCommId
        ? documents.filter(d => d.community_id.toString() === selectedCommId)
        : [];

    return (
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
                                                    onClick={() => onDeleteDocument(doc.filename, doc.community_id)}
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
                                            onClick={() => onDeleteDocument(doc.filename, doc.community_id)}
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
    );
}
