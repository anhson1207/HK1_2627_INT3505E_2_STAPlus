import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, CircularProgress, MenuItem, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";

import { userSchema, type UserFormData } from "../../utils/settingsSchema";

interface UserFormProps {
    initialData?: Partial<UserFormData>;
    onSubmit: (data: UserFormData) => Promise<void>;
    onCancel: () => void;
    error?: string;
    submitLabel?: string;
}

export default function UserForm({ initialData, onSubmit, onCancel, error, submitLabel = "Lưu người dùng" }: UserFormProps) {
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: { fullName: initialData?.fullName ?? "", email: initialData?.email ?? "", phone: initialData?.phone ?? "", department: initialData?.department ?? "", avatar: initialData?.avatar ?? "", role: initialData?.role ?? "SALES", status: initialData?.status ?? "ACTIVE" },
    });
    return <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">{error && <Alert severity="error">{error}</Alert>}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Controller name="fullName" control={control} render={({ field }) => <TextField {...field} label="Họ và tên" required fullWidth disabled={isSubmitting} error={!!errors.fullName} helperText={errors.fullName?.message} />} />
            <Controller name="email" control={control} render={({ field }) => <TextField {...field} type="email" label="Email" required fullWidth disabled={isSubmitting} error={!!errors.email} helperText={errors.email?.message} />} />
            <Controller name="phone" control={control} render={({ field }) => <TextField {...field} label="Số điện thoại" fullWidth disabled={isSubmitting} error={!!errors.phone} helperText={errors.phone?.message} />} />
            <Controller name="department" control={control} render={({ field }) => <TextField {...field} label="Phòng ban" fullWidth disabled={isSubmitting} error={!!errors.department} helperText={errors.department?.message} />} />
            <Controller name="role" control={control} render={({ field }) => <TextField {...field} select label="Vai trò" required fullWidth disabled={isSubmitting} error={!!errors.role} helperText={errors.role?.message}><MenuItem value="ADMIN">Admin</MenuItem><MenuItem value="SALES">Sales</MenuItem><MenuItem value="SUPPORT">Support</MenuItem></TextField>} />
            <Controller name="status" control={control} render={({ field }) => <TextField {...field} select label="Trạng thái" required fullWidth disabled={isSubmitting} error={!!errors.status} helperText={errors.status?.message}><MenuItem value="ACTIVE">Hoạt động</MenuItem><MenuItem value="INACTIVE">Ngừng hoạt động</MenuItem></TextField>} />
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>Hủy</Button><Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}>{isSubmitting ? "Đang lưu..." : submitLabel}</Button></div>
    </form>;
}
