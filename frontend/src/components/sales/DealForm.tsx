import React, { useState } from "react";
import Form from "../shared/Form";

interface DealFormData {
    name: string;
    customerName: string;
    value: number;
    stage: string;
    probability: number;
    assignee: string;
}

interface DealFormProps {
    initialValues?: Partial<DealFormData>;
    onSubmit: (data: DealFormData) => void;
    onCancel: () => void;
}

export const DealForm: React.FC<DealFormProps> = ({
    initialValues,
    onSubmit,
    onCancel,
}) => {
    const [formData, setFormData] = useState<DealFormData>({
        name: initialValues?.name || "",
        customerName: initialValues?.customerName || "",
        value: initialValues?.value || 0,
        stage: initialValues?.stage || "New",
        probability: initialValues?.probability || 10,
        assignee: initialValues?.assignee || "",
    });

    const handleChange = (
        field: keyof DealFormData,
        value: string | number,
    ) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(formData);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <div className="space-y-5">
                <div>
                    <label className="mb-1 block text-xs font-semibold text-(--crm-text-secondary)">
                        Tên cơ hội *
                    </label>

                    <input
                        type="text"
                        value={formData.name}
                        onChange={(event) =>
                            handleChange("name", event.target.value)
                        }
                        className="w-full rounded-md border border-(--crm-border) px-3 py-2 text-sm outline-none focus:border-(--crm-primary-soft)"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-(--crm-text-secondary)">
                            Khách hàng *
                        </label>

                        <input
                            type="text"
                            value={formData.customerName}
                            onChange={(event) =>
                                handleChange(
                                    "customerName",
                                    event.target.value,
                                )
                            }
                            className="w-full rounded-md border border-(--crm-border) px-3 py-2 text-sm outline-none focus:border-(--crm-primary-soft)"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-(--crm-text-secondary)">
                            Giá trị
                        </label>

                        <input
                            type="number"
                            value={formData.value}
                            onChange={(event) =>
                                handleChange(
                                    "value",
                                    Number(event.target.value),
                                )
                            }
                            className="w-full rounded-md border border-(--crm-border) px-3 py-2 text-sm outline-none focus:border-(--crm-primary-soft)"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-(--crm-text-secondary)">
                            Giai đoạn
                        </label>

                        <select
                            value={formData.stage}
                            onChange={(event) =>
                                handleChange("stage", event.target.value)
                            }
                            className="w-full rounded-md border border-(--crm-border) bg-(--crm-surface) px-3 py-2 text-sm"
                        >
                            <option value="New">New</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Proposal">Proposal</option>
                            <option value="Negotiation">Negotiation</option>
                            <option value="Won">Won</option>
                            <option value="Lost">Lost</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-(--crm-text-secondary)">
                            Xác suất (%)
                        </label>

                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.probability}
                            onChange={(event) =>
                                handleChange(
                                    "probability",
                                    Number(event.target.value),
                                )
                            }
                            className="w-full rounded-md border border-(--crm-border) px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-(--crm-text-secondary)">
                            Người phụ trách
                        </label>

                        <input
                            type="text"
                            value={formData.assignee}
                            onChange={(event) =>
                                handleChange("assignee", event.target.value)
                            }
                            className="w-full rounded-md border border-(--crm-border) px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-(--crm-border-subtle) pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-md border border-(--crm-border) px-4 py-2 text-sm hover:bg-(--crm-surface-subtle)"
                    >
                        Hủy
                    </button>

                    <button
                        type="submit"
                        className="crm-btn crm-btn--primary"
                    >
                        Lưu cơ hội
                    </button>
                </div>
            </div>
        </Form>
    );
};

export default DealForm;
