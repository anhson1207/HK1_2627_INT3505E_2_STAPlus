import { Controller, useForm } from "react-hook-form";

import { Alert, Button, CircularProgress, MenuItem, TextField } from "@mui/material";

import { leadSchema, type LeadFormData } from "../../utils/leadSchema";

import { zodResolver } from "@hookform/resolvers/zod";
import { LEAD_SOURCE_OPTIONS, LEAD_STATUS_OPTIONS } from "../../utils/constants";

interface LeadFormProps {
    onSubmit: (data: LeadFormData) => void | Promise<void>;
    onCancel: () => void;
    initialData?: Partial<LeadFormData>;
    submitLabel?: string;
    serverError?: string;
}

export default function LeadForm({
    onSubmit,
    onCancel,
    initialData,
    submitLabel = "Lưu Lead",
    serverError,
}: LeadFormProps) {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LeadFormData>({
        resolver: zodResolver(leadSchema),
        defaultValues: {
            firstName: initialData?.firstName ?? "",
            lastName: initialData?.lastName ?? "",
            email: initialData?.email ?? "",
            phone: initialData?.phone ?? "",
            company: initialData?.company ?? "",
            source: initialData?.source ?? "WEBSITE",
            status: initialData?.status ?? "NEW",
            ownerName: initialData?.ownerName ?? "",
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {serverError && <Alert severity="error">{serverError}</Alert>}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Họ"
                            fullWidth
                            error={!!errors.firstName}
                            helperText={errors.firstName?.message}
                            autoComplete="given-name"
                            disabled={isSubmitting}
                        />
                    )}
                />

                <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Tên"
                            fullWidth
                            error={!!errors.lastName}
                            helperText={errors.lastName?.message}
                            autoComplete="family-name"
                            disabled={isSubmitting}
                        />
                    )}
                />

                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Email"
                            type="email"
                            fullWidth
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            autoComplete="email"
                            disabled={isSubmitting}
                        />
                    )}
                />

                <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Số điện thoại"
                            fullWidth
                            error={!!errors.phone}
                            helperText={errors.phone?.message}
                            autoComplete="tel"
                            disabled={isSubmitting}
                        />
                    )}
                />

                <Controller
                    name="company"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Công ty"
                            fullWidth
                            error={!!errors.company}
                            helperText={errors.company?.message}
                            autoComplete="organization"
                            disabled={isSubmitting}
                        />
                    )}
                />

                <Controller
                    name="ownerName"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Người phụ trách"
                            fullWidth
                            error={!!errors.ownerName}
                            helperText={errors.ownerName?.message}
                            disabled={isSubmitting}
                        />
                    )}
                />

                <Controller
                    name="source"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            select
                            label="Nguồn Lead"
                            fullWidth
                            disabled={isSubmitting}
                            error={!!errors.source}
                            helperText={errors.source?.message}
                        >
                            {LEAD_SOURCE_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                />

                <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            select
                            label="Trạng thái"
                            fullWidth
                            disabled={isSubmitting}
                            error={!!errors.status}
                            helperText={errors.status?.message}
                        >
                            {LEAD_STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
                    Hủy
                </Button>

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
