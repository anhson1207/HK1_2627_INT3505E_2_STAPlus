import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import type { Deal, DealStage } from "../../types/deal";
import { formatVND } from "../../utils/currency";
import DealCard from "./DealCard";
import { getDealStageLabel } from "../../utils/dealStage";

interface DealKanbanColumnProps {
    stage: DealStage;
    deals: Deal[];
    onView: (deal: Deal) => void;
}

export default function DealKanbanColumn({ stage, deals, onView }: DealKanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id: `stage-${stage}` });
    const totalValue = deals.reduce((total, deal) => total + deal.value, 0);

    return (
        <section ref={setNodeRef} className={`crm-kanban-column crm-stage--${stage.toLowerCase()} ${isOver ? "is-over" : ""}`}>
            <div className="crm-kanban-column__accent" />
            <header className="crm-kanban-column__header">
                <div className="flex items-center justify-between gap-2"><h2 className="crm-kanban-column__title">{getDealStageLabel(stage)}</h2><span className="rounded-full bg-(--crm-surface) px-2 py-0.5 text-xs text-(--crm-text-secondary)">{deals.length} deals</span></div>
                <p className="crm-kanban-column__meta">{formatVND(totalValue)}</p>
            </header>
            <SortableContext items={deals.map((deal) => `deal-${deal.id}`)} strategy={verticalListSortingStrategy}>
                <div className="crm-kanban-column__body">
                    {deals.map((deal) => <DealCard key={deal.id} deal={deal} onView={onView} />)}
                    {deals.length === 0 && <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-(--crm-border) px-4 text-center text-xs text-(--crm-text-muted)">Kéo Deal vào đây</div>}
                </div>
            </SortableContext>
        </section>
    );
}
