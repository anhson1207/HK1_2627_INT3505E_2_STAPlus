import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DealForm from "../../components/deals/DealForm";
import { dealService, getDealErrorMessage } from "../../services/dealService";
import type { DealFormData } from "../../utils/dealSchema";

export default function DealCreatePage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const handleSubmit = async (data: DealFormData) => {
        setError("");
        try { await dealService.createDeal(data); navigate("/deals", { replace: true }); }
        catch (submitError) { setError(getDealErrorMessage(submitError)); }
    };
    return <div className="max-w-5xl"><div className="mb-6"><h1 className="crm-page-title">Thêm Deal</h1><p className="crm-page-description">Tạo cơ hội bán hàng mới</p></div><div className="crm-card crm-card__body"><DealForm onSubmit={handleSubmit} onCancel={() => navigate("/deals")} submitLabel="Tạo Deal" serverError={error} /></div></div>;
}
