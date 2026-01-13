"use client"; // <--- This line was missing

import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
    message: string | null;
    type: string | null;
}

export default function AlertBanner({ message, type }: Props) {
    const [isVisible, setIsVisible] = useState(true);

    if (!message || !isVisible) return null;

    const styles = {
        info: "bg-blue-600 text-white",
        warning: "bg-amber-500 text-white",
        emergency: "bg-red-600 text-white"
    };

    const icons = {
        info: <Info className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        emergency: <AlertCircle className="w-5 h-5" />
    };

    // Default to info if type is unknown
    const currentStyle = styles[type as keyof typeof styles] || styles.info;
    const currentIcon = icons[type as keyof typeof icons] || icons.info;

    return (
        <div className={`${currentStyle} px-4 py-3 shadow-md relative z-50 animate-in slide-in-from-top duration-300`}>
            <div className="container mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 font-medium">
                    {currentIcon}
                    <p>{message}</p>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}