import type { DealStage } from "../../types/deal";

import { getDealStageLabel } from "../../utils/dealStage";

const badgeClasses: Record<DealStage, string> = {
    NEW: "crm-status--new",
    QUALIFIED: "crm-status--qualified",
    PROPOSAL: "crm-status--proposal",
    NEGOTIATION: "crm-status--negotiation",
    WON: "crm-status--won",
    LOST: "crm-status--lost",
};

export default function DealStageBadge({ stage }: { stage: DealStage }) {
    return <span className={`crm-status ${badgeClasses[stage]}`}>{getDealStageLabel(stage)}</span>;
}
