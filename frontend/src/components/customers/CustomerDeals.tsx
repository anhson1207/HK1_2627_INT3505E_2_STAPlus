import { BriefcaseBusiness } from "lucide-react";

import type { CustomerDeal, CustomerDealStage } from "../../types/customer360";

interface CustomerDealsProps {
    deals: readonly CustomerDeal[];
}

const stageConfig: Record<CustomerDealStage, { label: string; className: string }> = {
    NEW: { label: "Mới", className: "crm-status--new" },
    QUALIFIED: { label: "Đủ điều kiện", className: "crm-status--qualified" },
    PROPOSAL: { label: "Đề xuất", className: "crm-status--proposal" },
    NEGOTIATION: { label: "Đàm phán", className: "crm-status--negotiation" },
    WON: { label: "Thành công", className: "crm-status--won" },
    LOST: { label: "Thất bại", className: "crm-status--lost" },
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const dateFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function CustomerDeals({ deals }: CustomerDealsProps) {
    if (deals.length === 0) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-(--crm-border) bg-(--crm-surface) px-6 text-center">
                <div className="mb-3 rounded-full bg-(--crm-surface-hover) p-4 text-(--crm-text-muted)"><BriefcaseBusiness size={26} /></div>
                <p className="font-medium text-(--crm-text)">Chưa có Deal nào</p>
            </div>
        );
    }

    return (
        <div className="crm-board">
            <div className="crm-table-wrap">
                <table className="crm-table">
                    <thead><tr className="border-b border-(--crm-border) bg-(--crm-surface-subtle)">
                        {["Deal", "Giá trị", "Stage", "Expected Close Date"].map((label) => <th key={label} className="px-5 py-3 text-left text-xs font-medium text-(--crm-text-secondary)">{label}</th>)}
                    </tr></thead>
                    <tbody>{deals.map((deal) => {
                        const stage = stageConfig[deal.stage];
                        return (
                            <tr key={deal.id} className="border-b border-(--crm-border-subtle) last:border-0 hover:bg-(--crm-surface-subtle)">
                                <td className="px-5 py-4 text-sm font-medium text-(--crm-heading)">{deal.name}</td>
                                <td className="px-5 py-4 text-sm text-(--crm-text)">{currencyFormatter.format(deal.value)}</td>
                                <td className="px-5 py-4"><span className={`crm-status ${stage.className}`}>{stage.label}</span></td>
                                <td className="px-5 py-4 text-sm text-(--crm-text-secondary)">{dateFormatter.format(new Date(`${deal.expectedCloseDate}T00:00:00`))}</td>
                            </tr>
                        );
                    })}</tbody>
                </table>
            </div>
        </div>
    );
}
