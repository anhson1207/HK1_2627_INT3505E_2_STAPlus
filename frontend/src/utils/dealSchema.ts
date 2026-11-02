import { z } from "zod";

export const dealSchema = z.object({
    name: z.string().trim().min(1, "Vui lòng nhập tên Deal"),
    customerId: z.number().int().positive("Vui lòng chọn khách hàng"),
    value: z.number().positive("Giá trị Deal phải lớn hơn 0"),
    discountPercent: z.number()
        .min(0, "Mức giảm giá tối thiểu là 0%")
        .max(100, "Mức giảm giá tối đa là 100%"),
    discountReason: z.string().trim().optional(),
    stage: z.enum(["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]),
    probability: z.number()
        .min(0, "Xác suất tối thiểu là 0")
        .max(100, "Xác suất tối đa là 100%"),
    expectedCloseDate: z.string().min(1, "Vui lòng chọn ngày dự kiến đóng"),
    ownerName: z.string().trim().optional(),
    description: z.string().trim().optional(),
});

export type DealFormData = z.infer<typeof dealSchema>;