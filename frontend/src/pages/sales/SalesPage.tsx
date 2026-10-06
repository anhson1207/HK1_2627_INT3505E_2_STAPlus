import React from "react";
import { useNavigate } from "react-router-dom";

import DealTable, {
    type DealItem,
} from "../../components/sales/DealTable";

const MOCK_DEALS: DealItem[] = [
    {
        id: "1",
        dealNumber: "#DEAL-001",
        name: "Gói CRM Enterprise",
        customerName: "Công ty ABC",
        value: 150000000,
        stage: "Negotiation",
        probability: 70,
        assignee: "Nguyễn Anh Sơn",
        updatedAt: "10 phút trước",
    },
    {
        id: "2",
        dealNumber: "#DEAL-002",
        name: "Triển khai hệ thống CRM",
        customerName: "Công ty XYZ",
        value: 85000000,
        stage: "Proposal",
        probability: 50,
        assignee: "Trần Minh",
        updatedAt: "2 giờ trước",
    },
    {
        id: "3",
        dealNumber: "#DEAL-003",
        name: "Gói Support Premium",
        customerName: "Công ty DEF",
        value: 45000000,
        stage: "Qualified",
        probability: 30,
        assignee: "Lê Hoàng",
        updatedAt: "Hôm qua",
    },
];

export const SalesPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-(--crm-surface-subtle) p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="crm-page-title">
                        Cơ hội bán hàng
                    </h1>

                    <p className="mt-1 text-xs text-(--crm-text-secondary)">
                        Quản lý pipeline và các cơ hội kinh doanh
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/sales/new")}
                    className="crm-btn crm-btn--primary"
                >
                    + Tạo cơ hội
                </button>
            </div>

            <DealTable
                deals={MOCK_DEALS}
                onRowClick={(id) => navigate(`/sales/${id}`)}
            />
        </div>
    );
};

export default SalesPage;
