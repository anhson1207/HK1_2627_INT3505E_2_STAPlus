import type { ReactNode } from "react";

interface AuthPageShellProps {
    title: string;
    description: string;
    children: ReactNode;
}

export default function AuthPageShell({ title, description, children }: AuthPageShellProps) {
    return (
        <main className="crm-auth-page">
            <div className="crm-auth-container">
                <div className="mb-6 text-center">
                    <div className="crm-sidebar__brand-mark mx-auto" aria-hidden="true">C</div>
                    <p className="mt-3 text-lg font-bold text-(--crm-heading)">CRM</p>
                </div>
                <div className="crm-card crm-card__body shadow-sm sm:p-8">
                    <div className="mb-6 text-center">
                        <h1 className="crm-auth-card__title">{title}</h1>
                        <p className="crm-auth-card__subtitle">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </main>
    );
}
