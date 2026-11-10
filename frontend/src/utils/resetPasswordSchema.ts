import { z } from "zod";
import { strongPasswordSchema } from "./passwordSchema";

export const resetPasswordSchema = z
    .object({
        password: strongPasswordSchema,
        confirmPassword: z
            .string()
            .min(1, "Vui lòng xác nhận mật khẩu."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp.",
        path: ["confirmPassword"],
    });

export type ResetPasswordFormData = z.infer<
    typeof resetPasswordSchema
>;
