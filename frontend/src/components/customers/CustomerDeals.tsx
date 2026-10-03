import { BriefcaseBusiness } from "lucide-react";

import type { CustomerDeal, CustomerDealStage } from "../../types/customer360";

interface CustomerDealsProps {
    deals: readonly CustomerDeal[];
}

const stageConfig: Record<CustomerDealStage, { label: string; className: string }> = {
    NEW: { label: "Mới", className: "bg-blue-50 text-blue-700" },
    QUALIFIED: { label: "Đủ điều kiện", className: "bg-cyan-50 text-cyan-700" },
    PROPOSAL: { label: "Đề xuất", className: "bg-violet-50 text-violet-700" },
    NEGOTIATION: { label: "Đàm phán", className: "bg-amber-50 text-amber-700" },
    WON: { label: "Thành công", className: "bg-emerald-50 text-emerald-700" },
    LOST: { label: "Thất bại", className: "bg-red-50 text-red-700" },
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const dateFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function CustomerDeals({ deals }: CustomerDealsProps) {
    if (deals.length === 0) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-center">
                <div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-400"><BriefcaseBusiness size={26} /></div>
                <p className="font-medium text-slate-700">Chưa có Deal nào</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse">
                    <thead><tr className="border-b border-slate-200 bg-slate-50">
                        {["Deal", "Giá trị", "Stage", "Expected Close Date"].map((label) => <th key={label} className="px-5 py-3 text-left text-xs font-medium text-slate-500">{label}</th>)}
                    </tr></thead>
                    <tbody>{deals.map((deal) => {
                        const stage = stageConfig[deal.stage];
                        return (
                            <tr key={deal.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                <td className="px-5 py-4 text-sm font-medium text-slate-800">{deal.name}</td>
                                <td className="px-5 py-4 text-sm text-slate-700">{currencyFormatter.format(deal.value)}</td>
                                <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${stage.className}`}>{stage.label}</span></td>
                                <td className="px-5 py-4 text-sm text-slate-600">{dateFormatter.format(new Date(`${deal.expectedCloseDate}T00:00:00`))}</td>
                            </tr>
                        );
                    })}</tbody>
                </table>
            </div>
        </div>
    );
}
