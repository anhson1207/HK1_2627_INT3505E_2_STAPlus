import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, CircularProgress, MenuItem, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";

import { customerService, getCustomerErrorMessage } from "../../services/customerService";
import type { Customer } from "../../types/customer";
import { dealSchema, type DealFormData } from "../../utils/dealSchema";
import { DEAL_STAGE_OPTIONS } from "../../utils/dealStage";

interface DealFormProps {
    onSubmit: (data: DealFormData) => void | Promise<void>;
    onCancel: () => void;
    initialData?: Partial<DealFormData>;
    submitLabel?: string;
    serverError?: string;
}

export default function DealForm({ onSubmit, onCancel, initialData, submitLabel = "Lưu Deal", serverError }: DealFormProps) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerError, setCustomerError] = useState("");
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<DealFormData>({
        resolver: zodResolver(dealSchema),
        defaultValues: {
            name: initialData?.name ?? "",
            customerId: initialData?.customerId ?? 0,
            value: initialData?.value ?? 0,
            stage: initialData?.stage ?? "NEW",
            probability: initialData?.probability ?? 0,
            expectedCloseDate: initialData?.expectedCloseDate ?? "",
            ownerName: initialData?.ownerName ?? "",
            description: initialData?.description ?? "",
        },
    });

    useEffect(() => {
        let active = true;
        const loadCustomers = async () => {
            try {
                const response = await customerService.getCustomers(0, 100);
                if (active) setCustomers(response.content);
            } catch (error) {
                if (active) setCustomerError(getCustomerErrorMessage(error));
            } finally {
                if (active) setLoadingCustomers(false);
            }
        };
        void loadCustomers();
        return () => { active = false; };
    }, []);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {(serverError || customerError) && <Alert severity="error">{serverError || customerError}</Alert>}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Controller name="name" control={control} render={({ field }) => <TextField {...field} label="Tên Deal" required fullWidth disabled={isSubmitting} error={!!errors.name} helperText={errors.name?.message} />} />
                <Controller name="customerId" control={control} render={({ field }) => (
                    <TextField {...field} value={field.value || ""} onChange={(event) => field.onChange(Number(event.target.value))} select label="Khách hàng" required fullWidth disabled={isSubmitting || loadingCustomers} error={!!errors.customerId} helperText={loadingCustomers ? "Đang tải khách hàng..." : errors.customerId?.message}>
                        {customers.map((customer) => <MenuItem key={customer.id} value={customer.id}>{customer.name} — {customer.company}</MenuItem>)}
                    </TextField>
                )} />
                <Controller name="value" control={control} render={({ field }) => <TextField {...field} onChange={(event) => field.onChange(Number(event.target.value))} label="Giá trị (VND)" type="number" required fullWidth disabled={isSubmitting} error={!!errors.value} helperText={errors.value?.message} slotProps={{ htmlInput: { min: 1 } }} />} />
                <Controller name="stage" control={control} render={({ field }) => <TextField {...field} select label="Giai đoạn" required fullWidth disabled={isSubmitting} error={!!errors.stage} helperText={errors.stage?.message}>{DEAL_STAGE_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField>} />
                <Controller name="probability" control={control} render={({ field }) => <TextField {...field} onChange={(event) => field.onChange(Number(event.target.value))} label="Xác suất (%)" type="number" required fullWidth disabled={isSubmitting} error={!!errors.probability} helperText={errors.probability?.message} slotProps={{ htmlInput: { min: 0, max: 100 } }} />} />
                <Controller name="expectedCloseDate" control={control} render={({ field }) => <TextField {...field} label="Ngày dự kiến đóng" type="date" required fullWidth disabled={isSubmitting} error={!!errors.expectedCloseDate} helperText={errors.expectedCloseDate?.message} slotProps={{ inputLabel: { shrink: true } }} />} />
                <Controller name="ownerName" control={control} render={({ field }) => <TextField {...field} label="Người phụ trách" fullWidth disabled={isSubmitting} error={!!errors.ownerName} helperText={errors.ownerName?.message} />} />
                <Controller name="description" control={control} render={({ field }) => <TextField {...field} label="Mô tả" multiline minRows={3} fullWidth disabled={isSubmitting} error={!!errors.description} helperText={errors.description?.message} className="md:col-span-2" />} />
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>Hủy</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting || loadingCustomers || Boolean(customerError)} startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}>{isSubmitting ? "Đang lưu..." : submitLabel}</Button>
            </div>
        </form>
    );
}
