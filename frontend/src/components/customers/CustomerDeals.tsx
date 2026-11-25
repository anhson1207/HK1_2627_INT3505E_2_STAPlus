import { BriefcaseBusiness, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { CustomerDeal, CustomerDealStage } from "../../types/customer360";

interface CustomerDealsProps {
    deals: readonly CustomerDeal[];
    customerId?: number;
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

export default function CustomerDeals({ deals, customerId }: CustomerDealsProps) {
    const navigate = useNavigate();

    if (deals.length === 0) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-(--crm-border) bg-(--crm-surface) px-6 text-center">
                <div className="mb-3 rounded-full bg-(--crm-surface-hover) p-4 text-(--crm-text-muted)"><BriefcaseBusiness size={26} /></div>
                <p className="font-medium text-(--crm-text)">Chưa có Deal nào</p>
                {customerId && (
                    <button
                        type="button"
                        onClick={() => navigate(`/deals/new?customerId=${customerId}`)}
                        className="mt-4 crm-btn crm-btn--primary"
                    >
                        <Plus size={16} /> Tạo Deal mới
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="crm-board">
            <div className="flex items-center justify-between p-4 border-b border-(--crm-border)">
                <h3 className="text-sm font-semibold text-(--crm-heading)">Danh sách Deal ({deals.length})</h3>
                {customerId && (
                    <button
                        type="button"
                        onClick={() => navigate(`/deals/new?customerId=${customerId}`)}
                        className="crm-btn crm-btn--primary text-xs"
                    >
                        <Plus size={14} /> Tạo Deal mới
                    </button>
                )}
            </div>
            <div className="crm-table-wrap">
                <table className="crm-table">
                    <thead>
                        <tr className="border-b border-(--crm-border) bg-(--crm-surface-subtle)">
                            <th style={{ width: "35%" }} className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Tên Deal</th>
                            <th style={{ width: "25%" }} className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Giá trị</th>
                            <th style={{ width: "20%" }} className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Giai đoạn</th>
                            <th style={{ width: "20%" }} className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Ngày dự kiến đóng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deals.map((deal) => {
                            const stage = stageConfig[deal.stage];
                            return (
                                <tr
                                    key={deal.id}
                                    onClick={() => navigate(`/deals/${deal.id}`)}
                                    className="border-b border-(--crm-border-subtle) last:border-0 hover:bg-(--crm-surface-subtle) cursor-pointer"
                                >
                                    <td className="px-5 py-4 text-center text-sm font-medium text-(--crm-primary) hover:underline">
                                        <span className="block truncate text-center" title={deal.name}>{deal.name}</span>
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-center text-sm text-(--crm-text)">{currencyFormatter.format(deal.value)}</td>
                                    <td className="whitespace-nowrap px-5 py-4 text-center"><span className={`crm-status ${stage.className}`}>{stage.label}</span></td>
                                    <td className="whitespace-nowrap px-5 py-4 text-center text-sm text-(--crm-text-secondary)">
                                        {deal.expectedCloseDate && !Number.isNaN(Date.parse(deal.expectedCloseDate))
                                            ? dateFormatter.format(
                                                  new Date(
                                                      deal.expectedCloseDate.includes("T")
                                                          ? deal.expectedCloseDate
                                                          : `${deal.expectedCloseDate}T00:00:00`,
                                                  ),
                                              )
                                            : "—"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
