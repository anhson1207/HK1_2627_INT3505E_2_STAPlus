
import { z } from "zod";

export const userSchema = z
    .object({
        fullName: z
            .string()
            .trim()
            .min(1, "Vui lòng nhập họ và tên."),

        email: z
            .string()
            .trim()
            .email("Email không hợp lệ."),

        phone: z.string().optional(),

        department: z.string().optional(),

        avatar: z.string().optional(),

        role: z.enum([
            "ADMIN",
            "SALES",
            "SUPPORT",
            "UNASSIGNED",
        ]),

        status: z.enum([
            "ACTIVE",
            "INACTIVE",
            "PENDING",
        ]),
    })
    .refine(
        (data) =>
            data.status !== "ACTIVE" ||
            data.role !== "UNASSIGNED",
        {
            message:
                "Tài khoản phải được phân quyền trước khi kích hoạt.",
            path: ["status"],
        }
    );

export type UserFormData = z.infer<typeof userSchema>;
