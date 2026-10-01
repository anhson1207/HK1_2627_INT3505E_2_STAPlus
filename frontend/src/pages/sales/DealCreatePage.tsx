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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => navigate("/sales")}
                    className="mb-3 text-sm text-gray-500 hover:text-gray-800"
                >
                    ← Quay lại
                </button>

                <h1 className="text-xl font-bold text-gray-800">
                    Tạo cơ hội mới
                </h1>

                <p className="mt-1 text-xs text-gray-500">
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