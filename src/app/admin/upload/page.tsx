"use client";

import { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, FileText } from 'lucide-react';

export default function AdminUploadPage() {
    const [communities, setCommunities] = useState<any[]>([]);
    const [selectedSlug, setSelectedSlug] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [customTitle, setCustomTitle] = useState('');
    const [category, setCategory] = useState('Auto'); // <--- NEW STATE
    const [status, setStatus] = useState<'idle' | 'parsing' | 'uploading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/communities').then(res => res.json()).then(setCommunities);
    }, []);

    // --- HELPER: Read Text File ---
    const readTextFile = async (file: File): Promise<string> => {
        return await file.text();
    };

    // --- HELPER: Parse PDF Client-Side ---
    const extractTextFromPDF = async (file: File): Promise<string> => {
        try {
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            let fullText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                // @ts-ignore
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += `\n--- [PAGE ${i}] ---\n${pageText}`;
            }
            return fullText;
        } catch (error) {
            console.error("PDF Parse Error:", error);
            return "";
        }
    };

    const handleUpload = async () => {
        if (!file || !selectedSlug) return;

        try {
            setStatus('parsing');
            let extractedText = "";

            // 1. Detect File Type & Extract Text
            if (file.type === "text/plain" || file.name.endsWith(".txt")) {
                extractedText = await readTextFile(file);
            } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
                extractedText = await extractTextFromPDF(file);
            } else {
                throw new Error("Unsupported file type. Only PDF and TXT are allowed.");
            }

            console.log(`Extracted ${extractedText.length} chars`);

            // 2. Upload to Server
            setStatus('uploading');
            const formData = new FormData();
            formData.append('file', file);
            formData.append('communitySlug', selectedSlug);
            formData.append('extractedText', extractedText);
            formData.append('category', category); // <--- SEND CATEGORY
            if (customTitle.trim()) formData.append('customTitle', customTitle.trim());

            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setStatus('success');
            setMessage(`Successfully uploaded: ${data.title}`);
            setFile(null);
            setCustomTitle('');
            setCategory('Auto'); // Reset category

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

                {/* 1. Community Select */}
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
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Choose File (PDF or TXT)</label>
                    <input
                        type="file"
                        accept=".pdf,.txt"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20"
                    />
                </div>

                {/* 3. Category Select (NEW) */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                    <select
                        className="w-full p-3 border border-slate-200 rounded-lg"
                        onChange={(e) => setCategory(e.target.value)}
                        value={category}
                    >
                        <option value="Auto">✨ Auto-Detect (Default)</option>
                        <option value="Governing">Governing Documents</option>
                        <option value="Forms">Forms & Applications</option>
                        <option value="Financials">Financials & Budgets</option>
                        <option value="General">General Information</option>
                    </select>
                </div>

                {/* 4. Custom Title */}
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Custom Title <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. 2025 Budget"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand/50 outline-none"
                    />
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!file || !selectedSlug || status === 'uploading' || status === 'parsing'}
                    className="w-full bg-brand text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                    {status === 'parsing' ? (
                        <><FileText className="animate-pulse" /> Reading File...</>
                    ) : status === 'uploading' ? (
                        <><Loader2 className="animate-spin" /> Uploading...</>
                    ) : (
                        "Upload & Process"
                    )}
                </button>

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