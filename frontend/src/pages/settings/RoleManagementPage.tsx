import { Check, X } from "lucide-react";
import AdminSettingsNav from "../../components/settings/AdminSettingsNav";
import { permissionRows, rolePermissions } from "../../config/rolePermissions";
import type { UserRole } from "../../types/user";

const roles: UserRole[] = ["ADMIN", "SALES", "SUPPORT", "MANAGER"];

export default function RoleManagementPage() {
    return (
        <div>
            <div className="crm-page-header">
                <div>
                    <h2 className="text-lg font-semibold text-(--crm-heading)">
                        Quản trị hệ thống
                    </h2>
                    <p className="crm-page-description">
                        Phân quyền RBAC (Role-Based Access Control) & Ma trận quyền hệ thống.
                    </p>
                </div>
            </div>

            <AdminSettingsNav />

            <div className="crm-card crm-card__body">
                <div className="mb-5">
                    <h3 className="text-base font-semibold text-(--crm-heading)">
                        Ma trận quyền truy cập theo vai trò
                    </h3>
                    <p className="crm-page-description">
                        Quy định quyền truy cập các module chính (Dashboard, Lead, Deal, Customer, Ticket, Settings, Audit Log).
                    </p>
                </div>
                <div className="crm-table-wrap">
                    <table className="crm-table">
                        <thead>
                            <tr className="border-b border-(--crm-border) bg-(--crm-surface-subtle) text-center text-xs text-(--crm-text-secondary)">
                                <th style={{ width: "36%" }} className="px-4 py-3 text-center">Chức năng</th>
                                {roles.map((role) => (
                                    <th key={role} className="px-4 py-3 text-center font-semibold">
                                        {role}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {permissionRows.map(({ resource, label }) => (
                                <tr key={resource} className="border-b border-(--crm-border-subtle) last:border-b-0 hover:bg-(--crm-surface-subtle)">
                                    <td className="px-4 py-3 text-center text-sm font-medium text-(--crm-text)">
                                        {label}
                                    </td>
                                    {roles.map((role) => (
                                        <td key={role} className="px-4 py-3 text-center">
                                            {rolePermissions[role]?.includes(resource) ? (
                                                <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 p-1 text-emerald-600">
                                                    <Check size={16} />
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center justify-center rounded-full bg-slate-100 p-1 text-slate-400">
                                                    <X size={16} />
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
