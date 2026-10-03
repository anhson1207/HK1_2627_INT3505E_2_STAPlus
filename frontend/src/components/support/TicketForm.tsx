import React, { useState } from "react";
import Form, { FormField } from "../shared/Form";

interface TicketFormProps {
    initialValues?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({
    initialValues,
    onSubmit,
    onCancel,
}) => {
    const [formData, setFormData] = useState(
        initialValues || {
            subject: "",
            customerName: "",
            priority: "Medium",
            status: "Open",
            description: "",
        }
    );

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(formData);
    };

    return (
        <Form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-md p-6 max-w-3xl"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        required
                    />
                </FormField>

                <FormField label="Mức độ Ưu tiên">
                    <select
                        value={formData.priority}
                        onChange={(event) =>
                            setFormData({
                                ...formData,
                                priority: event.target.value,
                            })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Hủy
                </button>

                <button
                    type="submit"
                    className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                    Lưu Ticket
                </button>
            </div>
        </Form>
    );
};

export default TicketForm;