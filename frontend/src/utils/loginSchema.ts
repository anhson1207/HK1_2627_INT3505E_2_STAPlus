import { z } from "zod";

export const loginSchema = z.object({
    username: z.string().trim().min(1, "Vui lòng nhập tên đăng nhập"),
    password: z.string().refine((value) => value.trim().length > 0, "Vui lòng nhập mật khẩu"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
