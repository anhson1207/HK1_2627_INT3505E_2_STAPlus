import type { ReactNode } from "react";

import { useAuthStore } from "../../stores/authStore";
import type { UserRole } from "../../types/auth";

interface RoleGuardProps {
    allowedRoles: readonly UserRole[];
    children: ReactNode;
    fallback?: ReactNode;
}

export default function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
    const role = useAuthStore((state) => state.user?.role);
    return role && allowedRoles.includes(role) ? children : fallback;
}
