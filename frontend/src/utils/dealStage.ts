import type { DealStage } from "../types/deal";

export const DEAL_STAGE_OPTIONS: ReadonlyArray<{ value: DealStage; label: string }> = [
    { value: "NEW", label: "Mới" },
    { value: "QUALIFIED", label: "Đủ điều kiện" },
    { value: "PROPOSAL", label: "Đề xuất" },
    { value: "NEGOTIATION", label: "Đàm phán" },
    { value: "WON", label: "Thành công" },
    { value: "LOST", label: "Thất bại" },
];

export function getDealStageLabel(stage: DealStage) {
    return DEAL_STAGE_OPTIONS.find((option) => option.value === stage)?.label ?? stage;
}
