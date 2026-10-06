import React from "react";

interface CardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export default function Card({
    title,
    children,
    className = "",
}: CardProps) {
    return (
        <div
            className={`crm-card crm-card__body ${className}`}
        >
            {title && (
                <h2 className="mb-4 text-sm font-semibold text-(--crm-heading)">
                    {title}
                </h2>
            )}

            {children}
        </div>
    );
}
