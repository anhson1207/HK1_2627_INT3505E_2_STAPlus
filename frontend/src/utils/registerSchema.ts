import { z } from "zod";

export const registerSchema = z.object({
    fullName: z.string().trim().min(1, "Vui lòng nhập họ tên"),
    email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
