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
            className={`rounded-md border border-gray-200 bg-white p-5 shadow-sm ${className}`}
        >
            {title && (
                <h2 className="mb-4 text-sm font-semibold text-gray-800">
                    {title}
                </h2>
            )}

            {children}
        </div>
    );
}