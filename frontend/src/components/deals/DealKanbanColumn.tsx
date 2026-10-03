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
        <section ref={setNodeRef} className={`flex w-80 shrink-0 flex-col rounded-xl border bg-slate-50/80 ${isOver ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"}`}>
            <header className="border-b border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold text-slate-800">{getDealStageLabel(stage)}</h2><span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">{deals.length} deals</span></div>
                <p className="mt-1 text-xs font-medium text-slate-500">{formatVND(totalValue)}</p>
            </header>
            <SortableContext items={deals.map((deal) => `deal-${deal.id}`)} strategy={verticalListSortingStrategy}>
                <div className="flex min-h-40 flex-1 flex-col gap-3 p-3">
                    {deals.map((deal) => <DealCard key={deal.id} deal={deal} onView={onView} />)}
                    {deals.length === 0 && <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-slate-300 px-4 text-center text-xs text-slate-400">Kéo Deal vào đây</div>}
                </div>
            </SortableContext>
        </section>
    );
}
