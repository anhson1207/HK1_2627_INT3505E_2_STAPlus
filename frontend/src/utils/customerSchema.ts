import { z } from "zod";

export const customerSchema = z.object({
    name: z.string().trim().min(1, "Vui lòng nhập tên khách hàng"),
    email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
    phone: z.string().trim().min(9, "Số điện thoại phải có ít nhất 9 ký tự"),
    company: z.string().trim().min(1, "Vui lòng nhập công ty"),
    address: z.string().trim().optional(),
    ownerName: z.string().trim().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
