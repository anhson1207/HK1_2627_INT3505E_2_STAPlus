import React from "react";
import { useNavigate } from "react-router-dom";

import DealForm from "../../components/sales/DealForm";

export const DealCreatePage: React.FC = () => {
    const navigate = useNavigate();

    const handleSubmit = (data: unknown) => {
        console.log("Create deal:", data);

        navigate("/sales");
    };

    return (
        <div className="min-h-screen bg-(--crm-surface-subtle) p-6">
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => navigate("/sales")}
                    className="mb-3 text-sm text-(--crm-text-secondary) hover:text-(--crm-heading)"
                >
                    ← Quay lại
                </button>

                <h1 className="crm-page-title">
                    Tạo cơ hội mới
                </h1>

                <p className="mt-1 text-xs text-(--crm-text-secondary)">
                    Nhập thông tin cơ hội bán hàng
                </p>
            </div>

            <DealForm
                onSubmit={handleSubmit}
                onCancel={() => navigate("/sales")}
            />
        </div>
    );
};

export default DealCreatePage;
