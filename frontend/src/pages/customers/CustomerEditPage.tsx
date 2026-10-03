import { Alert, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CustomerForm from "../../components/customers/CustomerForm";
import { customerService, getCustomerErrorMessage } from "../../services/customerService";
import type { Customer } from "../../types/customer";
import type { CustomerFormData } from "../../utils/customerSchema";

export default function CustomerEditPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const customerId = Number(id);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        let active = true;

        const loadCustomer = async () => {
            if (!Number.isInteger(customerId) || customerId <= 0) {
                setLoadError("Mã khách hàng không hợp lệ.");
                setLoading(false);
                return;
            }

            try {
                const data = await customerService.getCustomerById(customerId);
                if (active) setCustomer(data);
            } catch (error) {
                if (active) setLoadError(getCustomerErrorMessage(error));
            } finally {
                if (active) setLoading(false);
            }
        };

        void loadCustomer();
        return () => { active = false; };
    }, [customerId]);

    const handleSubmit = async (data: CustomerFormData) => {
        setSubmitError("");
        try {
            await customerService.updateCustomer(customerId, data);
            navigate(`/customers/${customerId}`, { replace: true });
        } catch (error) {
            setSubmitError(getCustomerErrorMessage(error));
        }
    };

    if (loading) return <div className="flex min-h-72 items-center justify-center"><CircularProgress /></div>;

    if (loadError || !customer) {
        return (
            <Alert severity="error" action={<button type="button" className="font-medium" onClick={() => navigate("/customers")}>Về danh sách</button>}>
                {loadError || "Không tìm thấy khách hàng."}
            </Alert>
        );
    }

    return (
        <div className="max-w-5xl">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">Chỉnh sửa khách hàng</h1>
                <p className="mt-1 text-sm text-slate-500">Cập nhật thông tin của {customer.name}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6">
                <CustomerForm
                    initialData={customer}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate(`/customers/${customerId}`)}
                    submitLabel="Lưu thay đổi"
                    serverError={submitError}
                />
            </div>
        </div>
    );
}
