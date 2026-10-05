import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, CircularProgress, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";

import { profileSchema, type ProfileFormData } from "../../utils/settingsSchema";

interface ProfileFormProps {
    initialData: ProfileFormData;
    onSubmit: (data: ProfileFormData) => Promise<void>;
    onCancel: () => void;
    error?: string;
}

export default function ProfileForm({ initialData, onSubmit, onCancel, error }: ProfileFormProps) {
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({ resolver: zodResolver(profileSchema), defaultValues: initialData });
    return <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {error && <Alert severity="error">{error}</Alert>}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Controller name="fullName" control={control} render={({ field }) => <TextField {...field} label="Họ và tên" required fullWidth disabled={isSubmitting} error={!!errors.fullName} helperText={errors.fullName?.message} />} />
            <Controller name="email" control={control} render={({ field }) => <TextField {...field} label="Email" type="email" fullWidth slotProps={{ input: { readOnly: true } }} helperText={errors.email?.message || "Email đăng nhập không thể thay đổi tại đây"} error={!!errors.email} />} />
            <Controller name="phone" control={control} render={({ field }) => <TextField {...field} label="Số điện thoại" fullWidth disabled={isSubmitting} error={!!errors.phone} helperText={errors.phone?.message} />} />
            <Controller name="department" control={control} render={({ field }) => <TextField {...field} label="Phòng ban" fullWidth disabled={isSubmitting} error={!!errors.department} helperText={errors.department?.message} />} />
            <Controller name="avatar" control={control} render={({ field }) => <TextField {...field} label="Avatar URL" fullWidth disabled={isSubmitting} error={!!errors.avatar} helperText={errors.avatar?.message || "Có thể để trống để dùng avatar mặc định"} className="md:col-span-2" />} />
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>Hủy</Button><Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}>{isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}</Button></div>
    </form>;
}
