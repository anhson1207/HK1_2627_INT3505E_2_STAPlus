import { Check, X } from "lucide-react";

import { permissionRows, rolePermissions } from "../../config/rolePermissions";
import type { UserRole } from "../../types/user";

const roles: UserRole[] = ["ADMIN", "SALES", "SUPPORT"];

export default function RoleManagementPage() {
    return <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-5"><h2 className="text-lg font-semibold text-slate-900">Vai trò & quyền truy cập</h2><p className="mt-1 text-sm text-slate-500">Ma trận quyền tham khảo của CRM. Chưa hỗ trợ chỉnh sửa quyền động.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[540px] border-collapse"><thead><tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500"><th className="px-4 py-3">Chức năng</th>{roles.map((role) => <th key={role} className="px-4 py-3 text-center">{role}</th>)}</tr></thead><tbody>{permissionRows.map(({ resource, label }) => <tr key={resource} className="border-b border-slate-100 last:border-b-0"><td className="px-4 py-3 text-sm font-medium text-slate-700">{label}</td>{roles.map((role) => <td key={role} className="px-4 py-3 text-center">{rolePermissions[role].includes(resource) ? <Check aria-label="Có quyền" className="mx-auto text-emerald-600" size={17} /> : <X aria-label="Không có quyền" className="mx-auto text-slate-300" size={17} />}</td>)}</tr>)}</tbody></table></div></div>;
}
