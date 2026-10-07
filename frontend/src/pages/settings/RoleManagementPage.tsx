import { Check, X } from "lucide-react";

import { permissionRows, rolePermissions } from "../../config/rolePermissions";
import type { UserRole } from "../../types/user";

const roles: UserRole[] = ["ADMIN", "SALES", "SUPPORT"];

export default function RoleManagementPage() {
    return <div className="crm-card crm-card__body"><div className="mb-5"><h2 className="text-lg font-semibold text-(--crm-heading)">Vai trò & quyền truy cập</h2><p className="crm-page-description">Ma trận quyền tham khảo của CRM. Chưa hỗ trợ chỉnh sửa quyền động.</p></div><div className="crm-table-wrap"><table className="crm-table"><thead><tr className="border-b border-(--crm-border) bg-(--crm-surface-subtle) text-left text-xs text-(--crm-text-secondary)"><th className="px-4 py-3">Chức năng</th>{roles.map((role) => <th key={role} className="px-4 py-3 text-center">{role}</th>)}</tr></thead><tbody>{permissionRows.map(({ resource, label }) => <tr key={resource} className="border-b border-(--crm-border-subtle) last:border-b-0"><td className="px-4 py-3 text-sm font-medium text-(--crm-text)">{label}</td>{roles.map((role) => <td key={role} className="px-4 py-3 text-center">{rolePermissions[role].includes(resource) ? <Check aria-label="Có quyền" className="mx-auto text-(--crm-green-dark)" size={17} /> : <X aria-label="Không có quyền" className="mx-auto text-(--crm-text-disabled)" size={17} />}</td>)}</tr>)}</tbody></table></div></div>;
}
