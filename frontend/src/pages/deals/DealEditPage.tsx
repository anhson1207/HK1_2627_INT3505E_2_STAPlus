import { Alert, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DealForm from "../../components/deals/DealForm";
import { dealService, getDealErrorMessage } from "../../services/dealService";
import type { Deal } from "../../types/deal";
import type { DealFormData } from "../../utils/dealSchema";

export default function DealEditPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const dealId = Number(id);
    const [deal, setDeal] = useState<Deal | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        let active = true;
        const loadDeal = async () => {
            if (!Number.isInteger(dealId) || dealId <= 0) { setLoadError("Mã Deal không hợp lệ."); setLoading(false); return; }
            try { const data = await dealService.getDealById(dealId); if (active) setDeal(data); }
            catch (error) { if (active) setLoadError(getDealErrorMessage(error)); }
            finally { if (active) setLoading(false); }
        };
        void loadDeal();
        return () => { active = false; };
    }, [dealId]);

    const handleSubmit = async (data: DealFormData) => {
        setSubmitError("");
        try { await dealService.updateDeal(dealId, data); navigate(`/deals/${dealId}`, { replace: true }); }
        catch (error) { setSubmitError(getDealErrorMessage(error)); }
    };

    if (loading) return <div className="flex min-h-72 items-center justify-center"><CircularProgress /></div>;
    if (loadError || !deal) return <Alert severity="error" action={<button type="button" className="font-medium" onClick={() => navigate("/deals")}>Về danh sách</button>}>{loadError || "Không tìm thấy Deal."}</Alert>;
    return <div className="max-w-5xl"><div className="mb-6"><h1 className="crm-page-title">Chỉnh sửa Deal</h1><p className="crm-page-description">Cập nhật {deal.name}</p></div><div className="crm-card crm-card__body"><DealForm initialData={deal} onSubmit={handleSubmit} onCancel={() => navigate(`/deals/${dealId}`)} submitLabel="Lưu thay đổi" serverError={submitError} /></div></div>;
}
