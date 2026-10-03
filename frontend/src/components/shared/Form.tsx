import React from "react";

interface FormProps {
    children: React.ReactNode;
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
    className?: string;
}

export default function Form({
    children,
    onSubmit,
    className = "",
}: FormProps) {
    return (
        <form
            onSubmit={onSubmit}
            className={`space-y-4 ${className}`}
        >
            {children}
        </form>
    );
}

interface FormFieldProps {
    label: string;
    children: React.ReactNode;
}

export function FormField({
    label,
    children,
}: FormFieldProps) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>

            {children}
        </div>
    );
}