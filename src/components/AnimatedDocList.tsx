"use client";

import { motion } from "framer-motion";
import { FileText, Download, Home, File } from 'lucide-react';

interface Doc {
    id: number;
    title: string;
    file_url: string;
}

interface Props {
    title: string;
    docs: Doc[];
    type: 'governing' | 'forms' | 'general';
    delay?: number;
}

export default function AnimatedDocList({ title, docs, type, delay = 0 }: Props) {
    if (docs.length === 0) return null;

    const getIcon = () => {
        if (type === 'governing') return <FileText className="w-5 h-5" />;
        if (type === 'forms') return <Home className="w-5 h-5" />;
        return <File className="w-5 h-5" />;
    };

    const getColorClass = () => {
        if (type === 'governing') return "bg-blue-50 text-brand group-hover:bg-brand group-hover:text-white";
        if (type === 'forms') return "bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white";
        return "bg-slate-100 text-slate-600 group-hover:bg-slate-600 group-hover:text-white";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
        >
            <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 font-bold text-slate-700 flex items-center gap-2">
                {title}
                <span className="text-xs font-normal text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {docs.length}
                </span>
            </div>
            <div className="divide-y divide-slate-50">
                {docs.map((doc) => (
                    <a
                        key={doc.id}
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-lg transition-colors duration-300 ${getColorClass()}`}>
                                {getIcon()}
                            </div>
                            <span className="font-medium text-slate-700 text-sm md:text-base">{doc.title}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:shadow-sm group-hover:text-brand transition-all">
                            <Download className="w-4 h-4" />
                        </div>
                    </a>
                ))}
            </div>
        </motion.div>
    );
}