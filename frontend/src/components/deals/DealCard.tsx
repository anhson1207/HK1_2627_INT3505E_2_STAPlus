import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";

import type { Deal } from "../../types/deal";
import { formatVND } from "../../utils/currency";

interface DealCardProps {
    deal: Deal;
    onView: (deal: Deal) => void;
}

export default function DealCard({ deal, onView }: DealCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `deal-${deal.id}` });
    return (
        <article
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={`cursor-grab touch-none select-none rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:border-blue-200 hover:shadow-md active:cursor-grabbing ${isDragging ? "z-50 opacity-60 shadow-lg" : ""}`}
            {...attributes}
            {...listeners}
        >
            <div className="flex items-start justify-between gap-2">
                <button type="button" onClick={() => onView(deal)} className="text-left text-sm font-semibold text-slate-900 hover:text-blue-600">{deal.name}</button>
                <GripVertical size={17} className="shrink-0 text-slate-400" aria-hidden="true" />
            </div>
            <p className="mt-1 text-xs text-slate-500">{deal.customerName}</p>
            <p className="mt-3 text-sm font-semibold text-blue-700">{formatVND(deal.value)}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500"><span>{deal.probability}% xác suất</span><span>{deal.ownerName || "—"}</span></div>
        </article>
    );
}
