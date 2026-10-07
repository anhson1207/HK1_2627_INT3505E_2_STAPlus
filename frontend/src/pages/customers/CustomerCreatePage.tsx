import { useState } from "react";
import { useNavigate } from "react-router-dom";

import CustomerForm from "../../components/customers/CustomerForm";
import { customerService, getCustomerErrorMessage } from "../../services/customerService";
import type { CustomerFormData } from "../../utils/customerSchema";

export default function CustomerCreatePage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleSubmit = async (data: CustomerFormData) => {
        setError("");
        try {
            await customerService.createCustomer(data);
            navigate("/customers", { replace: true });
        } catch (submitError) {
            setError(getCustomerErrorMessage(submitError));
        }
    };

    return (
        <div className="max-w-5xl">
            <div className="mb-6">
                <h1 className="crm-page-title">Thêm khách hàng</h1>
                <p className="crm-page-description">Tạo hồ sơ khách hàng mới</p>
            </div>
            <div className="crm-card crm-card__body">
                <CustomerForm onSubmit={handleSubmit} onCancel={() => navigate("/customers")} submitLabel="Tạo khách hàng" serverError={error} />
            </div>
        </div>
    );
}
