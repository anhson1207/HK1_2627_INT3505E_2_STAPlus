import { z } from "zod";

export const leadSchema = z.object({
    firstName: z.string().trim().min(1, "Vui lòng nhập họ").max(50, "Họ tối đa 50 ký tự"),

    lastName: z.string().trim().min(1, "Vui lòng nhập tên").max(50, "Tên tối đa 50 ký tự"),

    email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),

    phone: z
        .string()
        .trim()
        .regex(/^(?:\+?[0-9][0-9 .-]{7,18}[0-9])$/, "Số điện thoại không hợp lệ"),

    company: z.string().trim().max(100, "Tên công ty tối đa 100 ký tự"),

    source: z.enum(["WEBSITE", "FACEBOOK", "ZALO", "GOOGLE_ADS", "REFERRAL", "OTHER"]),

    status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]),

    ownerName: z.string().trim().max(100, "Tên người phụ trách tối đa 100 ký tự").optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
