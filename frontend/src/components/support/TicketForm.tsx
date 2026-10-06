import React, { useState } from "react";
import Form, { FormField } from "../shared/Form";

export interface SupportTicketFormData {
    subject: string;
    customerName: string;
    priority: "Low" | "Medium" | "High" | "Urgent";
    status: "Open" | "In Progress" | "Resolved" | "Closed";
    description: string;
}

interface TicketFormProps {
    initialValues?: Partial<SupportTicketFormData>;
    onSubmit: (data: SupportTicketFormData) => void;
    onCancel: () => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({
    initialValues,
    onSubmit,
    onCancel,
}) => {
    const [formData, setFormData] = useState<SupportTicketFormData>(
        {
            subject: "",
            customerName: "",
            priority: "Medium",
            status: "Open",
            description: "",
            ...initialValues,
        }
    );

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(formData);
    };

    return (
        <Form
            onSubmit={handleSubmit}
            className="bg-(--crm-surface) border border-(--crm-border) rounded-md p-6 max-w-3xl"
        >
            <FormField label="Tiêu đề Yêu cầu *">
                <input
                    type="text"
                    value={formData.subject}
                    onChange={(event) =>
                        setFormData({
                            ...formData,
                            subject: event.target.value,
                        })
                    }
                    className="w-full px-3 py-2 border border-(--crm-border) rounded-md text-sm focus:ring-1 focus:ring-(--crm-primary-soft) focus:outline-none"
                    required
                />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
                <FormField label="Tên Khách hàng *">
                    <input
                        type="text"
                        value={formData.customerName}
                        onChange={(event) =>
                            setFormData({
                                ...formData,
                                customerName: event.target.value,
                            })
                        }
                        className="w-full px-3 py-2 border border-(--crm-border) rounded-md text-sm focus:ring-1 focus:ring-(--crm-primary-soft) focus:outline-none"
                        required
                    />
                </FormField>

                <FormField label="Mức độ Ưu tiên">
                    <select
                        value={formData.priority}
                        onChange={(event) =>
                            setFormData({
                                ...formData,
                            priority: event.target.value as SupportTicketFormData["priority"],
                            })
                        }
                        className="w-full px-3 py-2 border border-(--crm-border) rounded-md text-sm bg-(--crm-surface) focus:ring-1 focus:ring-(--crm-primary-soft) focus:outline-none"
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                    </select>
                </FormField>
            </div>

            <FormField label="Mô tả sự cố / Nội dung">
                <textarea
                    rows={5}
                    value={formData.description}
                    onChange={(event) =>
                        setFormData({
                            ...formData,
                            description: event.target.value,
                        })
                    }
                    className="w-full px-3 py-2 border border-(--crm-border) rounded-md text-sm focus:ring-1 focus:ring-(--crm-primary-soft) focus:outline-none"
                />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-(--crm-border-subtle)">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-1.5 text-sm border border-(--crm-border) rounded-md hover:bg-(--crm-surface-subtle)"
                >
                    Hủy
                </button>

                <button
                    type="submit"
                    className="crm-btn crm-btn--primary"
                >
                    Lưu Ticket
                </button>
            </div>
        </Form>
    );
};

export default TicketForm;
