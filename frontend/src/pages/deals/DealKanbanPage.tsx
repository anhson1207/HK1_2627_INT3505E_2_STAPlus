import { closestCorners, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import { BadgeDollarSign, BriefcaseBusiness, Plus, Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DealKanbanColumn from "../../components/deals/DealKanbanColumn";
import DealViewToggle from "../../components/deals/DealViewToggle";
import { dealService, getDealErrorMessage } from "../../services/dealService";
import type { Deal, DealStage } from "../../types/deal";
import { formatVND } from "../../utils/currency";
import { DEAL_STAGE_OPTIONS } from "../../utils/dealStage";

export default function DealKanbanPage() {
    const navigate = useNavigate();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 2 } }));

    useEffect(() => {
        let active = true;
        const loadDeals = async () => {
            try {
                const response = await dealService.getDeals(0, 1000);
                if (active) setDeals(response.content);
            } catch (loadError) {
                if (active) setError(getDealErrorMessage(loadError));
            } finally {
                if (active) setLoading(false);
            }
        };
        void loadDeals();
        return () => { active = false; };
    }, []);

    const handleDragEnd = async ({ active, over }: DragEndEvent) => {
        if (!over) return;
        const dealId = Number(String(active.id).replace("deal-", ""));
        const currentDeal = deals.find((deal) => deal.id === dealId);
        if (!currentDeal) return;

        const overId = String(over.id);
        const targetStage = overId.startsWith("stage-")
            ? overId.replace("stage-", "") as DealStage
            : deals.find((deal) => deal.id === Number(overId.replace("deal-", "")))?.stage;
        if (!targetStage || targetStage === currentDeal.stage) return;

        const previousStage = currentDeal.stage;
        setDeals((items) => items.map((deal) => deal.id === dealId ? { ...deal, stage: targetStage } : deal));
        try {
            await dealService.updateDealStage(dealId, targetStage);
            setMessage(`Đã chuyển “${currentDeal.name}” sang ${DEAL_STAGE_OPTIONS.find((item) => item.value === targetStage)?.label}.`);
        } catch (updateError) {
            setDeals((items) => items.map((deal) => deal.id === dealId ? { ...deal, stage: previousStage } : deal));
            setError(getDealErrorMessage(updateError));
        }
    };

    if (loading) return <div className="flex min-h-72 items-center justify-center"><CircularProgress /></div>;

    const totalPipelineValue = deals.filter((deal) => deal.stage !== "LOST").reduce((total, deal) => total + deal.value, 0);
    const weightedPipeline = deals.reduce((total, deal) => total + deal.value * deal.probability / 100, 0);
    const wonDeals = deals.filter((deal) => deal.stage === "WON").length;
    const lostDeals = deals.filter((deal) => deal.stage === "LOST").length;
    const winRate = wonDeals + lostDeals === 0 ? 0 : Math.round(wonDeals / (wonDeals + lostDeals) * 100);
    const summaries = [
        { label: "Total Pipeline Value", value: formatVND(totalPipelineValue), icon: BriefcaseBusiness, color: "bg-blue-50 text-blue-600" },
        { label: "Weighted Pipeline", value: formatVND(weightedPipeline), icon: BadgeDollarSign, color: "bg-violet-50 text-violet-600" },
        { label: "Won Deals", value: String(wonDeals), icon: Trophy, color: "bg-emerald-50 text-emerald-600" },
        { label: "Win Rate", value: `${winRate}%`, icon: Target, color: "bg-amber-50 text-amber-600" },
    ];

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-[22px] font-semibold text-slate-900">Sales Pipeline</h1><p className="mt-1 text-sm text-slate-500">Theo dõi Deal theo từng giai đoạn</p></div><div className="flex items-center gap-3"><DealViewToggle view="kanban" /><button type="button" onClick={() => navigate("/deals/new")} className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"><Plus size={16} /> Thêm Deal</button></div></div>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{summaries.map(({ label, value, icon: Icon, color }) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold text-slate-900">{value}</p></div><div className={`rounded-lg p-2.5 ${color}`}><Icon size={19} /></div></div></div>)}</div>
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={(event) => void handleDragEnd(event)}>
                <div className="overflow-x-auto pb-4"><div className="flex min-w-max items-stretch gap-4">{DEAL_STAGE_OPTIONS.map((stage) => <DealKanbanColumn key={stage.value} stage={stage.value} deals={deals.filter((deal) => deal.stage === stage.value)} onView={(deal) => navigate(`/deals/${deal.id}`)} />)}</div></div>
            </DndContext>
            <Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={() => setMessage("")} message={message} />
        </div>
    );
}
