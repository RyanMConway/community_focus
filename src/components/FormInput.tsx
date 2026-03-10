import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    error?: string;
}

export function FormInput({ label, id, error, className = '', ...props }: FormInputProps) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1.5">
                {label}
            </label>
            <input
                id={id}
                className={`w-full p-3 bg-slate-50 border ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-brand focus:ring-brand/20'} rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${className}`}
                {...props}
                aria-describedby={error ? `${id}-error` : undefined}
                aria-invalid={error ? 'true' : undefined}
            />
            {error && (
                <p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    id: string;
    error?: string;
}

export function FormTextarea({ label, id, error, className = '', ...props }: FormTextareaProps) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1.5">
                {label}
            </label>
            <textarea
                id={id}
                className={`w-full p-3 bg-slate-50 border ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-brand focus:ring-brand/20'} rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all resize-none ${className}`}
                {...props}
                aria-describedby={error ? `${id}-error` : undefined}
                aria-invalid={error ? 'true' : undefined}
            />
            {error && (
                <p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
