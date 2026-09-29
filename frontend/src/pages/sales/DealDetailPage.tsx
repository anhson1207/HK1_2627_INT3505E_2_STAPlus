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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate("/sales")}
                        className="mb-3 text-sm text-gray-500 hover:text-gray-800"
                    >
                        ← Quay lại
                    </button>

                    <h1 className="text-xl font-bold text-gray-800">
                        {deal.name}
                    </h1>

                    <p className="mt-1 text-xs text-gray-500">
                        {deal.dealNumber}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate(`/sales/${deal.id}/edit`)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Chỉnh sửa
                </button>
            </div>

            <DealDetail deal={deal} />
        </div>
    );
};

export default DealDetailPage;