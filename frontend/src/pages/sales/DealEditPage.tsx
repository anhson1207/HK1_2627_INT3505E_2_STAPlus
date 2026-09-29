import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import DealForm from "../../components/sales/DealForm";

const MOCK_DEAL = {
    name: "Gói CRM Enterprise",
    customerName: "Công ty ABC",
    value: 150000000,
    stage: "Negotiation",
    probability: 70,
    assignee: "Nguyễn Anh Sơn",
};

export const DealEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const handleSubmit = (data: unknown) => {
        console.log("Update deal:", id, data);

        navigate(`/sales/${id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => navigate(`/sales/${id}`)}
                    className="mb-3 text-sm text-gray-500 hover:text-gray-800"
                >
                    ← Quay lại
                </button>

                <h1 className="text-xl font-bold text-gray-800">
                    Chỉnh sửa cơ hội
                </h1>

                <p className="mt-1 text-xs text-gray-500">
                    Cập nhật thông tin cơ hội bán hàng
                </p>
            </div>

            <DealForm
                initialValues={MOCK_DEAL}
                onSubmit={handleSubmit}
                onCancel={() => navigate(`/sales/${id}`)}
            />
        </div>
    );
};

export default DealEditPage;