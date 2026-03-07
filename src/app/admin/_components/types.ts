export interface Message {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    user_type: string;
    message: string;
    created_at: string;
    status: string;
}

export interface Community {
    id: number;
    name: string;
    city: string;
    portal_url: string;
    slug: string;
    alert_message?: string;
    alert_type?: 'info' | 'warning' | 'emergency';
    alert_start_time?: string;
    alert_end_time?: string;
}

export interface Vendor {
    id: number;
    name: string;
    specialty: string;
    website_url: string;
    active: boolean;
}

export interface Event {
    id: number;
    community_id: number;
    title: string;
    event_date: string;
    event_time: string;
    location: string;
}

export interface NewsPost {
    id: number;
    community_id: number;
    title: string;
    content: string;
    created_at: string;
}

export interface Manager {
    id: number;
    name: string;
    email: string;
    phone: string;
    communities: { id: number; name: string }[];
}

export interface Document {
    id: string;
    filename: string;
    community_id: number;
    community_name: string;
    chunk_count: number;
    created_at: string;
}

export interface BidRequest {
    id: number;
    community_name: string;
    association_type: string;
    unit_count: number;
    city: string;
    current_situation: string;
    services_needed: string[];
    biggest_challenge: string | null;
    timeline: string;
    contact_name: string;
    contact_role: string;
    contact_email: string;
    contact_phone: string;
    best_time: string;
    status: 'new' | 'contacted' | 'won' | 'lost';
    created_at: string;
}

export interface AnalyticsData {
    total: number;
    categories: { category: string; count: number }[];
    topics: { topic: string; category: string; count: number }[];
    communities: { name: string; count: number }[];
    feed: { id: number; topic: string; category: string; created_at: string; community_name: string }[];
}
