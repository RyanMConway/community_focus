"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
    Mail, Building2, Loader, ShieldAlert, BarChart3,
    Users, BrainCircuit, BookOpen, Calendar, Megaphone, HardHat, FileSignature
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { Community, Message, Document, Manager } from './_components/types';
import InboxTab from './_components/InboxTab';
import CommunitiesTab from './_components/CommunitiesTab';
import ManagersTab from './_components/ManagersTab';
import VendorsTab from './_components/VendorsTab';
import EventsTab from './_components/EventsTab';
import NewsTab from './_components/NewsTab';
import BrainTab from './_components/BrainTab';
import KnowledgeTab from './_components/KnowledgeTab';
import AnalyticsTab from './_components/AnalyticsTab';
import BidsTab from './_components/BidsTab';

type Tab = 'inbox' | 'communities' | 'managers' | 'vendors' | 'events' | 'news' | 'knowledge' | 'analytics' | 'brain' | 'bids';

const TABS = [
    { id: 'inbox',       icon: Mail,          label: 'Inbox' },
    { id: 'bids',        icon: FileSignature,  label: 'Proposals' },
    { id: 'communities', icon: Building2,      label: 'Communities' },
    { id: 'events',      icon: Calendar,       label: 'Events' },
    { id: 'news',        icon: Megaphone,      label: 'News' },
    { id: 'vendors',     icon: HardHat,        label: 'Vendors' },
    { id: 'managers',    icon: Users,          label: 'Managers' },
    { id: 'brain',       icon: BrainCircuit,   label: 'Brain' },
    { id: 'knowledge',   icon: BookOpen,       label: 'Docs' },
    { id: 'analytics',   icon: BarChart3,      label: 'Stats' },
] as const;

export default function AdminDashboard() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('inbox');
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    // Shared data — used by multiple tabs
    const [messages, setMessages] = useState<Message[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [loading, setLoading] = useState(true);

    // --- AUTH CHECK ---
    useEffect(() => {
        if (isLoaded && user) {
            fetch('/api/auth/me')
                .then(res => res.json())
                .then(data => {
                    if (data.authorized) {
                        setIsAuthorized(true);
                        loadInitialData();
                    } else {
                        setIsAuthorized(false);
                        setLoading(false);
                    }
                })
                .catch(() => {
                    setIsAuthorized(false);
                    setLoading(false);
                });
        }
    }, [isLoaded, user]);

    // --- LAZY-LOAD MANAGERS ON TAB SWITCH ---
    useEffect(() => {
        if (activeTab === 'managers' && isAuthorized && managers.length === 0) {
            loadManagers();
        }
    }, [activeTab, isAuthorized]);

    const loadInitialData = async () => {
        try {
            const [msgData, commData, docData] = await Promise.all([
                fetch('/api/admin/messages').then(r => r.json()),
                fetch('/api/admin/communities').then(r => r.json()),
                fetch('/api/admin/documents').then(r => r.json()),
            ]);
            setMessages(msgData || []);
            setCommunities(commData || []);
            setDocuments(docData || []);
        } catch {
            toast.error("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const loadManagers = () =>
        fetch('/api/admin/managers').then(r => r.json()).then(setManagers);

    const handleMarkRead = async (id: number) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m));
        await fetch(`/api/admin/messages/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'read' })
        });
        toast.success("Marked as read");
    };

    const handleDeleteMessage = async (id: number) => {
        if (!confirm('Delete message?')) return;
        setMessages(prev => prev.filter(m => m.id !== id));
        await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
        toast.success("Message deleted");
    };

    const handleDeleteDocument = async (filename: string, communityId: number) => {
        if (!confirm(`Permanently delete "${filename}"?`)) return;
        const t = toast.loading("Deleting file...");
        await fetch(`/api/admin/documents?id=${encodeURIComponent(filename)}&communityId=${communityId}`, { method: 'DELETE' });
        loadInitialData();
        toast.success("File deleted", { id: t });
    };

    // --- LOADING / AUTH STATES ---
    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    }

    if (isAuthorized === false) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 max-w-md w-full">
                    <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h1>
                    <p className="text-red-600 mb-6">
                        You are logged in as: <code className="bg-red-100 px-2 py-1 rounded text-sm font-mono">{user?.primaryEmailAddress?.emailAddress}</code>
                    </p>
                    <button onClick={() => router.push('/')} className="bg-white border border-red-200 text-red-700 px-6 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors">
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header & Tab Bar */}
            <div className="bg-brand-dark text-white pt-24 pb-20 px-8 relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end relative z-10">
                    <div>
                        <h1 className="text-3xl font-serif font-bold mb-2">Admin Portal</h1>
                        <p className="text-brand-accent/80">Manager Dashboard</p>
                    </div>
                    <div className="flex gap-2 mt-6 md:mt-0 bg-white/10 p-1 rounded-lg backdrop-blur-sm overflow-x-auto max-w-full no-scrollbar">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-300 hover:text-white'}`}
                            >
                                <tab.icon className="w-4 h-4" /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-12 relative z-20">
                {activeTab === 'inbox' && (
                    <InboxTab messages={messages} onMarkRead={handleMarkRead} onDelete={handleDeleteMessage} />
                )}
                {activeTab === 'communities' && (
                    <CommunitiesTab communities={communities} onRefresh={loadInitialData} />
                )}
                {activeTab === 'managers' && (
                    <ManagersTab managers={managers} communities={communities} onRefresh={loadManagers} />
                )}
                {activeTab === 'vendors' && <VendorsTab />}
                {activeTab === 'events' && <EventsTab communities={communities} />}
                {activeTab === 'news' && <NewsTab communities={communities} />}
                {activeTab === 'brain' && <BrainTab communities={communities} />}
                {activeTab === 'knowledge' && (
                    <KnowledgeTab communities={communities} documents={documents} onDeleteDocument={handleDeleteDocument} />
                )}
                {activeTab === 'analytics' && <AnalyticsTab communities={communities} />}
                {activeTab === 'bids' && <BidsTab />}
            </div>
        </div>
    );
}
