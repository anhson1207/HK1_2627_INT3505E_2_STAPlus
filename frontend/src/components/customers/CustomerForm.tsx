import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, CircularProgress, MenuItem, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";

import { customerSchema, type CustomerFormData } from "../../utils/customerSchema";

interface CustomerFormProps {
    onSubmit: (data: CustomerFormData) => void | Promise<void>;
    onCancel: () => void;
    initialData?: Partial<CustomerFormData>;
    submitLabel?: string;
    serverError?: string;
}

export default function CustomerForm({
    onSubmit,
    onCancel,
    initialData,
    submitLabel = "Lưu khách hàng",
    serverError,
}: CustomerFormProps) {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: initialData?.name ?? "",
            email: initialData?.email ?? "",
            phone: initialData?.phone ?? "",
            company: initialData?.company ?? "",
            address: initialData?.address ?? "",
            ownerName: initialData?.ownerName ?? "",
            status: initialData?.status ?? "ACTIVE",
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {serverError && <Alert severity="error">{serverError}</Alert>}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Tên khách hàng" fullWidth required disabled={isSubmitting} error={!!errors.name} helperText={errors.name?.message} autoComplete="name" />
                    )}
                />
                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Email" type="email" fullWidth required disabled={isSubmitting} error={!!errors.email} helperText={errors.email?.message} autoComplete="email" />
                    )}
                />
                <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Số điện thoại" fullWidth required disabled={isSubmitting} error={!!errors.phone} helperText={errors.phone?.message} autoComplete="tel" />
                    )}
                />
                <Controller
                    name="company"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Công ty" fullWidth required disabled={isSubmitting} error={!!errors.company} helperText={errors.company?.message} autoComplete="organization" />
                    )}
                />
                <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Địa chỉ" fullWidth disabled={isSubmitting} error={!!errors.address} helperText={errors.address?.message} autoComplete="street-address" />
                    )}
                />
                <Controller
                    name="ownerName"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Người phụ trách" fullWidth disabled={isSubmitting} error={!!errors.ownerName} helperText={errors.ownerName?.message} />
                    )}
                />
                <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} select label="Trạng thái" fullWidth disabled={isSubmitting} error={!!errors.status} helperText={errors.status?.message}>
                            <MenuItem value="ACTIVE">Đang hoạt động</MenuItem>
                            <MenuItem value="INACTIVE">Ngừng hoạt động</MenuItem>
                        </TextField>
                    )}
                />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>Hủy</Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    {isSubmitting ? "Đang lưu..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}
