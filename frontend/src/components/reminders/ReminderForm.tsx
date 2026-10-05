import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, CircularProgress, MenuItem, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { customerService } from "../../services/customerService";
import { dealService } from "../../services/dealService";
import { leadService } from "../../services/leadService";
import type { ReminderEntityType } from "../../types/reminder";
import { reminderSchema, type ReminderFormData } from "../../utils/reminderSchema";

interface EntityOption { id: number; name: string }
interface ReminderFormProps {
    initialData?: Partial<ReminderFormData>;
    onSubmit: (data: ReminderFormData) => void | Promise<void>;
    onCancel: () => void;
    serverError?: string;
    submitLabel?: string;
}

export default function ReminderForm({ initialData, onSubmit, onCancel, serverError, submitLabel = "Lưu nhắc việc" }: ReminderFormProps) {
    const [entities, setEntities] = useState<EntityOption[]>([]);
    const [loadingEntities, setLoadingEntities] = useState(true);
    const [entityError, setEntityError] = useState("");
    const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ReminderFormData>({
        resolver: zodResolver(reminderSchema),
        defaultValues: {
            title: initialData?.title ?? "", description: initialData?.description ?? "",
            dueDate: initialData?.dueDate ?? "", dueTime: initialData?.dueTime ?? "09:00",
            entityType: initialData?.entityType ?? "LEAD", entityId: initialData?.entityId ?? 0,
            ownerName: initialData?.ownerName ?? "",
        },
    });
    const entityType = useWatch({ control, name: "entityType" });

    useEffect(() => {
        let active = true;
        const load = async () => {
            setLoadingEntities(true); setEntityError("");
            try {
                let options: EntityOption[];
                if (entityType === "LEAD") {
                    const result = await leadService.getLeads({ page: 0, size: 1000 });
                    options = result.content.map((lead) => ({ id: lead.id, name: `${lead.firstName} ${lead.lastName}`.trim() }));
                } else if (entityType === "CUSTOMER") {
                    const result = await customerService.getCustomers(0, 1000);
                    options = result.content.map((customer) => ({ id: customer.id, name: customer.name }));
                } else {
                    const result = await dealService.getDeals(0, 1000);
                    options = result.content.map((deal) => ({ id: deal.id, name: deal.name }));
                }
                if (active) setEntities(options);
            } catch (loadError) {
                if (active) setEntityError(loadError instanceof Error ? loadError.message : "Không thể tải đối tượng liên quan.");
            } finally {
                if (active) setLoadingEntities(false);
            }
        };
        void load();
        return () => { active = false; };
    }, [entityType]);

    const handleTypeChange = (value: ReminderEntityType) => {
        setValue("entityType", value);
        setValue("entityId", 0);
        setEntities([]);
    };

    return <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {(serverError || entityError) && <Alert severity="error">{serverError || entityError}</Alert>}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Controller name="title" control={control} render={({ field }) => <TextField {...field} label="Tiêu đề" required fullWidth disabled={isSubmitting} error={!!errors.title} helperText={errors.title?.message} className="md:col-span-2" />} />
            <Controller name="description" control={control} render={({ field }) => <TextField {...field} label="Mô tả" multiline minRows={3} fullWidth disabled={isSubmitting} error={!!errors.description} helperText={errors.description?.message} className="md:col-span-2" />} />
            <Controller name="dueDate" control={control} render={({ field }) => <TextField {...field} type="date" label="Ngày đến hạn" required fullWidth disabled={isSubmitting} slotProps={{ inputLabel: { shrink: true } }} error={!!errors.dueDate} helperText={errors.dueDate?.message} />} />
            <Controller name="dueTime" control={control} render={({ field }) => <TextField {...field} type="time" label="Giờ đến hạn" required fullWidth disabled={isSubmitting} slotProps={{ inputLabel: { shrink: true } }} error={!!errors.dueTime} helperText={errors.dueTime?.message} />} />
            <Controller name="entityType" control={control} render={({ field }) => <TextField {...field} select label="Loại liên quan" required fullWidth disabled={isSubmitting} onChange={(event) => handleTypeChange(event.target.value as ReminderEntityType)} error={!!errors.entityType} helperText={errors.entityType?.message}><MenuItem value="LEAD">Lead</MenuItem><MenuItem value="CUSTOMER">Khách hàng</MenuItem><MenuItem value="DEAL">Deal</MenuItem></TextField>} />
            <Controller name="entityId" control={control} render={({ field }) => <TextField {...field} select label="Đối tượng liên quan" required fullWidth value={field.value || ""} onChange={(event) => field.onChange(Number(event.target.value))} disabled={isSubmitting || loadingEntities || Boolean(entityError)} error={!!errors.entityId} helperText={loadingEntities ? "Đang tải..." : errors.entityId?.message}>{entities.map((entity) => <MenuItem key={entity.id} value={entity.id}>{entity.name}</MenuItem>)}</TextField>} />
            <Controller name="ownerName" control={control} render={({ field }) => <TextField {...field} label="Người phụ trách" fullWidth disabled={isSubmitting} error={!!errors.ownerName} helperText={errors.ownerName?.message} />} />
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>Hủy</Button><Button type="submit" variant="contained" disabled={isSubmitting || loadingEntities || Boolean(entityError)} startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}>{isSubmitting ? "Đang lưu..." : submitLabel}</Button></div>
    </form>;
}
