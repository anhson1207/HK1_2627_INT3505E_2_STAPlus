import { z } from "zod";
import { strongPasswordSchema } from "./passwordSchema";

export const registerSchema = z
    .object({
        username: z.string().trim().min(1, "Vui lòng nhập tên đăng nhập."),
        email: z
            .string()
            .trim()
            .min(1, "Vui lòng nhập email.")
            .email("Email không hợp lệ."),
        password: strongPasswordSchema,
        confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp.",
        path: ["confirmPassword"],
    });

export type RegisterFormData = z.infer<typeof registerSchema>;
