import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().trim().min(1, "Vui lòng nhập tên đăng nhập"),
    email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
    password: z.string().refine((value) => value.trim().length > 0, "Vui lòng nhập mật khẩu"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
