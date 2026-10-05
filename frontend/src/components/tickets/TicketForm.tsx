import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, CircularProgress, MenuItem, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";

import { customerService, getCustomerErrorMessage } from "../../services/customerService";
import type { Customer } from "../../types/customer";
import { ticketSchema, type TicketFormData } from "../../utils/ticketSchema";
import { SUPPORT_AGENT_OPTIONS, TICKET_PRIORITY_OPTIONS, TICKET_STATUS_OPTIONS } from "../../utils/ticketOptions";

interface TicketFormProps {
    onSubmit: (data: TicketFormData) => void | Promise<void>;
    onCancel: () => void;
    initialData?: Partial<TicketFormData>;
    submitLabel?: string;
    serverError?: string;
}

export default function TicketForm({ onSubmit, onCancel, initialData, submitLabel = "Lưu Ticket", serverError }: TicketFormProps) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const [customerError, setCustomerError] = useState("");
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<TicketFormData>({
        resolver: zodResolver(ticketSchema),
        defaultValues: { subject: initialData?.subject ?? "", customerId: initialData?.customerId ?? 0, description: initialData?.description ?? "", priority: initialData?.priority ?? "MEDIUM", status: initialData?.status ?? "OPEN", assignedTo: initialData?.assignedTo ?? "" },
    });

    useEffect(() => {
        let active = true;
        const loadCustomers = async () => {
            try { const response = await customerService.getCustomers(0, 100); if (active) setCustomers(response.content); }
            catch (error) { if (active) setCustomerError(getCustomerErrorMessage(error)); }
            finally { if (active) setLoadingCustomers(false); }
        };
        void loadCustomers();
        return () => { active = false; };
    }, []);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {(serverError || customerError) && <Alert severity="error">{serverError || customerError}</Alert>}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Controller name="subject" control={control} render={({ field }) => <TextField {...field} label="Tiêu đề" required fullWidth disabled={isSubmitting} error={!!errors.subject} helperText={errors.subject?.message} />} />
                <Controller name="customerId" control={control} render={({ field }) => <TextField {...field} value={field.value || ""} onChange={(event) => field.onChange(Number(event.target.value))} select label="Khách hàng" required fullWidth disabled={isSubmitting || loadingCustomers} error={!!errors.customerId} helperText={loadingCustomers ? "Đang tải khách hàng..." : errors.customerId?.message}>{customers.map((customer) => <MenuItem key={customer.id} value={customer.id}>{customer.name} — {customer.company}</MenuItem>)}</TextField>} />
                <Controller name="priority" control={control} render={({ field }) => <TextField {...field} select label="Mức ưu tiên" required fullWidth disabled={isSubmitting} error={!!errors.priority} helperText={errors.priority?.message}>{TICKET_PRIORITY_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField>} />
                <Controller name="status" control={control} render={({ field }) => <TextField {...field} select label="Trạng thái" required fullWidth disabled={isSubmitting} error={!!errors.status} helperText={errors.status?.message}>{TICKET_STATUS_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField>} />
                <Controller name="assignedTo" control={control} render={({ field }) => <TextField {...field} select label="Phân công cho" fullWidth disabled={isSubmitting} error={!!errors.assignedTo} helperText={errors.assignedTo?.message}><MenuItem value="">Chưa phân công</MenuItem>{SUPPORT_AGENT_OPTIONS.map((agent) => <MenuItem key={agent} value={agent}>{agent}</MenuItem>)}</TextField>} />
                <Controller name="description" control={control} render={({ field }) => <TextField {...field} label="Mô tả" required multiline minRows={4} fullWidth disabled={isSubmitting} error={!!errors.description} helperText={errors.description?.message} className="md:col-span-2" />} />
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>Hủy</Button><Button type="submit" variant="contained" disabled={isSubmitting || loadingCustomers || Boolean(customerError)} startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}>{isSubmitting ? "Đang lưu..." : submitLabel}</Button></div>
        </form>
    );
}
