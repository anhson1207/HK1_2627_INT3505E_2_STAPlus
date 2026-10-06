import type { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <div className="crm-page-header">
            <div className="crm-page-header__main">
                <h1 className="crm-page-title">{title}</h1>
                {description && <p className="crm-page-description">{description}</p>}
            </div>
            {actions && <div className="crm-page-header__actions">{actions}</div>}
        </div>
    );
}
