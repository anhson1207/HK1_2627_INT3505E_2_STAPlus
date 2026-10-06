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
            className={`crm-form ${className}`}
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
        <div className="crm-field">
            <label className="crm-label">
                {label}
            </label>

            {children}
        </div>
    );
}
