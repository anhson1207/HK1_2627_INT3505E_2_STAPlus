import { z } from "zod";

export const profileSchema = z.object({
    fullName: z.string().trim().min(1, "Vui lòng nhập họ tên"),
    email: z.string().trim().email("Email không hợp lệ"),
    phone: z.string().trim().optional(),
    department: z.string().trim().optional(),
    avatar: z.union([z.literal(""), z.string().url("URL avatar không hợp lệ")]).optional(),
});
export type ProfileFormData = z.infer<typeof profileSchema>;

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
            "MANAGER",
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
