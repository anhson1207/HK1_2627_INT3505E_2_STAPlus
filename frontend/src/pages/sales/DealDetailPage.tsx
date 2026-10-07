import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import DealDetail from "../../components/sales/DealDetail";

import type { DealItem } from "../../components/sales/DealTable";

const MOCK_DEAL: DealItem = {
    id: "1",
    dealNumber: "#DEAL-001",
    name: "Gói CRM Enterprise",
    customerName: "Công ty ABC",
    value: 150000000,
    stage: "Negotiation",
    probability: 70,
    assignee: "Nguyễn Anh Sơn",
    updatedAt: "10 phút trước",
};

export const DealDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const deal = {
        ...MOCK_DEAL,
        id: id || MOCK_DEAL.id,
    };

    return (
        <div className="min-h-screen bg-(--crm-surface-subtle) p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate("/sales")}
                        className="mb-3 text-sm text-(--crm-text-secondary) hover:text-(--crm-heading)"
                    >
                        ← Quay lại
                    </button>

                    <h1 className="crm-page-title">
                        {deal.name}
                    </h1>

                    <p className="mt-1 text-xs text-(--crm-text-secondary)">
                        {deal.dealNumber}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate(`/sales/${deal.id}/edit`)}
                    className="rounded-md border border-(--crm-border) bg-(--crm-surface) px-4 py-2 text-sm font-medium text-(--crm-text) hover:bg-(--crm-surface-subtle)"
                >
                    Chỉnh sửa
                </button>
            </div>

            <DealDetail deal={deal} />
        </div>
    );
};

export default DealDetailPage;
