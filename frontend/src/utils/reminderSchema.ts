import { z } from "zod";

export const reminderSchema = z.object({
    title: z.string().trim().min(1, "Vui lòng nhập tiêu đề"),
    description: z.string().trim().optional(),
    dueDate: z.string().min(1, "Vui lòng chọn ngày đến hạn"),
    dueTime: z.string().min(1, "Vui lòng chọn giờ đến hạn"),
    entityType: z.enum(["LEAD", "CUSTOMER", "DEAL"]),
    entityId: z.number().int().positive("Vui lòng chọn đối tượng liên quan"),
    ownerName: z.string().trim().optional(),
}).superRefine((data, context) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.dueDate) || !/^\d{2}:\d{2}$/.test(data.dueTime)) {
        context.addIssue({ code: "custom", path: ["dueDate"], message: "Ngày hoặc giờ không hợp lệ" });
        return;
    }
    const date = new Date(`${data.dueDate}T${data.dueTime}:00`);
    if (Number.isNaN(date.getTime()) || date.getFullYear() !== Number(data.dueDate.slice(0, 4)) || date.getMonth() + 1 !== Number(data.dueDate.slice(5, 7)) || date.getDate() !== Number(data.dueDate.slice(8, 10))) {
        context.addIssue({ code: "custom", path: ["dueDate"], message: "Ngày đến hạn không hợp lệ" });
    }
});

export type ReminderFormData = z.infer<typeof reminderSchema>;
