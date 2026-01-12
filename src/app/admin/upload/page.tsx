"use client";

import { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminUploadPage() {
    const [communities, setCommunities] = useState<any[]>([]);
    const [selectedSlug, setSelectedSlug] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    // Fetch communities for the dropdown
    useEffect(() => {
        fetch('/api/communities').then(res => res.json()).then(setCommunities);
    }, []);

    const handleUpload = async () => {
        if (!file || !selectedSlug) return;

        setStatus('uploading');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('communitySlug', selectedSlug);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setStatus('success');
            setMessage(`Successfully uploaded: ${data.title}`);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-32 px-6">
            <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-brand/10 rounded-lg">
                        <Upload className="w-6 h-6 text-brand" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Upload Document</h1>
                </div>

                {/* 1. Select Community */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Select Community</label>
                    <select
                        className="w-full p-3 border border-slate-200 rounded-lg"
                        onChange={(e) => setSelectedSlug(e.target.value)}
                        value={selectedSlug}
                    >
                        <option value="">-- Choose a Community --</option>
                        {communities.map(c => (
                            <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* 2. File Picker */}
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Choose PDF</label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-brand/10 file:text-brand
                          hover:file:bg-brand/20"
                    />
                </div>

                {/* 3. Submit Button */}
                <button
                    onClick={handleUpload}
                    disabled={!file || !selectedSlug || status === 'uploading'}
                    className="w-full bg-brand text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                    {status === 'uploading' ? (
                        <><Loader2 className="animate-spin" /> Processing...</>
                    ) : (
                        "Upload & Process"
                    )}
                </button>

                {/* 4. Status Messages */}
                {status === 'success' && (
                    <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {message}
                    </div>
                )}
                {status === 'error' && (
                    <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}