import { useState } from "react";
import { Button, TextField } from "@mui/material";
import { Save, RotateCcw } from "lucide-react";

interface ProfileFormProps {
    initialValues?: {
        fullName?: string;
        email?: string;
        phone?: string;
        jobTitle?: string;
    };
    onSubmit?: (values: {
        fullName: string;
        email: string;
        phone: string;
        jobTitle: string;
    }) => void;
}

export default function ProfileForm({
    initialValues,
    onSubmit,
}: ProfileFormProps) {
    const [form, setForm] = useState({
        fullName: initialValues?.fullName ?? "",
        email: initialValues?.email ?? "",
        phone: initialValues?.phone ?? "",
        jobTitle: initialValues?.jobTitle ?? "",
    });

    const [saved, setSaved] = useState(false);

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
        setSaved(false);
    };

    const handleReset = () => {
        setForm({
            fullName: initialValues?.fullName ?? "",
            email: initialValues?.email ?? "",
            phone: initialValues?.phone ?? "",
            jobTitle: initialValues?.jobTitle ?? "",
        });
        setSaved(false);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.fullName.trim() || !form.email.trim()) {
            return;
        }

        onSubmit?.(form);
        setSaved(true);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <h2 className="text-lg font-semibold text-(--crm-heading)">
                    Thông tin cá nhân
                </h2>
                <p className="mt-1 text-sm text-(--crm-text-secondary)">
                    Quản lý thông tin hồ sơ của bạn.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextField
                    label="Họ và tên"
                    value={form.fullName}
                    onChange={(event) =>
                        handleChange("fullName", event.target.value)
                    }
                    required
                    fullWidth
                />

                <TextField
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                        handleChange("email", event.target.value)
                    }
                    required
                    fullWidth
                />

                <TextField
                    label="Số điện thoại"
                    value={form.phone}
                    onChange={(event) =>
                        handleChange("phone", event.target.value)
                    }
                    fullWidth
                />

                <TextField
                    label="Chức danh"
                    value={form.jobTitle}
                    onChange={(event) =>
                        handleChange("jobTitle", event.target.value)
                    }
                    fullWidth
                />
            </div>

            {saved && (
                <p className="text-sm text-green-600">
                    Thông tin đã được gửi để lưu.
                </p>
            )}

            <div className="flex flex-wrap justify-end gap-3">
                <Button
                    type="button"
                    variant="outlined"
                    startIcon={<RotateCcw size={16} />}
                    onClick={handleReset}
                >
                    Đặt lại
                </Button>

                <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save size={16} />}
                >
                    Lưu thay đổi
                </Button>
            </div>
        </form>
    );
}