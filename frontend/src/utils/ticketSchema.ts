import { z } from "zod";

export const ticketSchema = z.object({
    subject: z.string().trim().min(1, "Vui lòng nhập tiêu đề Ticket"),
    description: z.string().trim().min(1, "Vui lòng nhập mô tả"),
    customerId: z.number().int().positive("Vui lòng chọn khách hàng"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
    assignedTo: z.string().trim().optional(),
});

export type TicketFormData = z.infer<typeof ticketSchema>;
