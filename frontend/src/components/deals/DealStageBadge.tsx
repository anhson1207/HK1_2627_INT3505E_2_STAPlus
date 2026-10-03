import type { DealStage } from "../../types/deal";

import { getDealStageLabel } from "../../utils/dealStage";

const badgeClasses: Record<DealStage, string> = {
    NEW: "border-blue-200 bg-blue-50 text-blue-700",
    QUALIFIED: "border-cyan-200 bg-cyan-50 text-cyan-700",
    PROPOSAL: "border-violet-200 bg-violet-50 text-violet-700",
    NEGOTIATION: "border-amber-200 bg-amber-50 text-amber-700",
    WON: "border-emerald-200 bg-emerald-50 text-emerald-700",
    LOST: "border-red-200 bg-red-50 text-red-700",
};

export default function DealStageBadge({ stage }: { stage: DealStage }) {
    return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClasses[stage]}`}>{getDealStageLabel(stage)}</span>;
}
