import { Button } from "@mui/material";
import { Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({ title, description, icon: Icon = Inbox, actionLabel, onAction }: EmptyStateProps) {
    return <div className="crm-empty"><span className="crm-empty__icon"><Icon size={27} /></span><h3 className="crm-empty__title">{title}</h3>{description && <p className="crm-empty__description">{description}</p>}{actionLabel && onAction && <Button variant="outlined" size="small" onClick={onAction} sx={{ mt: 2 }}>{actionLabel}</Button>}</div>;
}
