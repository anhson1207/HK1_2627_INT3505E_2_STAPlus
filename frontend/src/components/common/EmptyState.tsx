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
    return <div className="flex min-h-64 flex-col items-center justify-center px-5 py-8 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Icon size={27} /></span><h3 className="mt-4 text-sm font-semibold text-slate-800">{title}</h3>{description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}{actionLabel && onAction && <Button variant="outlined" size="small" onClick={onAction} sx={{ mt: 2 }}>{actionLabel}</Button>}</div>;
}
