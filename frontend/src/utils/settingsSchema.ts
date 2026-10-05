import { z } from "zod";

export const profileSchema = z.object({
    fullName: z.string().trim().min(1, "Vui lòng nhập họ tên"),
    email: z.email("Email không hợp lệ"),
    phone: z.string().trim().optional(),
    department: z.string().trim().optional(),
    avatar: z.union([z.literal(""), z.url("URL avatar không hợp lệ")]).optional(),
});
export type ProfileFormData = z.infer<typeof profileSchema>;

export const userSchema = profileSchema.extend({
    role: z.enum(["ADMIN", "SALES", "SUPPORT"]),
    status: z.enum(["ACTIVE", "INACTIVE"]),
});
export type UserFormData = z.infer<typeof userSchema>;
