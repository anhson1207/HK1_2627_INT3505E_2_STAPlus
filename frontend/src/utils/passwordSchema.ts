import { z } from "zod";

export const PASSWORD_REQUIREMENT_RULES = [
    {
        id: "minLength",
        label: "Ít nhất 8 ký tự",
        test: (value: string) => value.length >= 8,
    },
    {
        id: "uppercase",
        label: "Chữ hoa (A-Z)",
        test: (value: string) => /[A-Z]/.test(value),
    },
    {
        id: "lowercase",
        label: "Chữ thường (a-z)",
        test: (value: string) => /[a-z]/.test(value),
    },
    {
        id: "number",
        label: "Chữ số (0-9)",
        test: (value: string) => /[0-9]/.test(value),
    },
    {
        id: "special",
        label: "1 ký tự đặc biệt (!@#$...)",
        test: (value: string) => /[^A-Za-z0-9\s]/.test(value),
    },
] as const;

/**
 * Zod schema dùng chung cho mật khẩu mạnh:
 * - Ít nhất 8 ký tự, tối đa 100 ký tự
 * - Không chứa khoảng trắng
 * - Ít nhất 1 chữ cái viết hoa (A-Z)
 * - Ít nhất 1 chữ cái viết thường (a-z)
 * - Ít nhất 1 chữ số (0-9)
 * - Ít nhất 1 ký tự đặc biệt (!@#$%^&*...)
 */
export const strongPasswordSchema = z
    .string()
    .min(1, "Vui lòng nhập mật khẩu.")
    .refine((value) => !/\s/.test(value), "Mật khẩu không được chứa khoảng trắng.")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
    .max(100, "Mật khẩu không được vượt quá 100 ký tự.")
    .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa (A-Z).")
    .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường (a-z).")
    .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số (0-9).")
    .regex(
        /[^A-Za-z0-9\s]/,
        "Mật khẩu phải có ít nhất 1 ký tự đặc biệt (ví dụ: !@#$%^&*)."
    );

export const companySetupOwnerSchema = z
    .object({
        adminFullName: z.string().trim().min(1, "Vui lòng nhập họ và tên Quản trị viên."),
        adminEmail: z
            .string()
            .trim()
            .min(1, "Vui lòng nhập địa chỉ email quản trị.")
            .email("Địa chỉ email quản trị không hợp lệ."),
        adminPassword: strongPasswordSchema,
        adminConfirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu."),
    })
    .refine((data) => data.adminPassword === data.adminConfirmPassword, {
        message: "Mật khẩu xác nhận không trùng khớp.",
        path: ["adminConfirmPassword"],
    });

export const employeeJoinSchema = z
    .object({
        fullName: z.string().trim().min(1, "Vui lòng nhập họ và tên của bạn."),
        email: z
            .string()
            .trim()
            .min(1, "Vui lòng nhập địa chỉ email.")
            .email("Địa chỉ email không hợp lệ."),
        password: strongPasswordSchema,
        confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp.",
        path: ["confirmPassword"],
    });

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại."),
        newPassword: strongPasswordSchema,
        confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới."),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "Mật khẩu mới không được trùng với mật khẩu hiện tại.",
        path: ["newPassword"],
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Xác nhận mật khẩu mới không khớp.",
        path: ["confirmPassword"],
    });
