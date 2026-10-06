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
            className={`crm-kanban-card touch-none select-none ${isDragging ? "is-dragging" : ""}`}
            {...attributes}
            {...listeners}
        >
            <div className="flex items-start justify-between gap-2">
                <button type="button" onClick={() => onView(deal)} className="crm-kanban-card__title text-left">{deal.name}</button>
                <GripVertical size={17} className="shrink-0 text-(--crm-text-muted)" aria-hidden="true" />
            </div>
            <p className="crm-kanban-card__customer">{deal.customerName}</p>
            <p className="crm-kanban-card__value mt-3">{formatVND(deal.value)}</p>
            <div className="crm-kanban-card__footer crm-muted text-xs"><span>{deal.probability}% xác suất</span><span>{deal.ownerName || "—"}</span></div>
        </article>
    );
}
