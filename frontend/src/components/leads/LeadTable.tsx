import { Eye, MoreHorizontal, Pencil, Trash2, UserRoundSearch } from "lucide-react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useState, type MouseEvent } from "react";

import type { Lead } from "../../types/lead";
import { getLeadSourceLabel } from "../../utils/constants";
import StatusChip from "../common/StatusChip";

interface LeadTableProps {
    leads: Lead[];
    onView: (lead: Lead) => void;
    onEdit: (lead: Lead) => void;
    onDelete: (lead: Lead) => void;
}

export default function LeadTable({ leads, onView, onEdit, onDelete }: LeadTableProps) {
    const [menu, setMenu] = useState<{ anchor: HTMLElement; lead: Lead } | null>(null);

    const openMenu = (event: MouseEvent<HTMLElement>, lead: Lead) => {
        event.stopPropagation();
        setMenu({ anchor: event.currentTarget, lead });
    };

    const runAction = (action: (lead: Lead) => void) => {
        if (menu) action(menu.lead);
        setMenu(null);
    };

    if (leads.length === 0) {
        return (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-400">
                    <UserRoundSearch size={28} />
                </div>
                <p className="font-medium text-slate-700">Không tìm thấy Lead</p>
                <p className="mt-1 text-sm text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc hiện tại.</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                            {[
                                "Tên Lead",
                                "Email",
                                "Số điện thoại",
                                "Nguồn",
                                "Trạng thái",
                                "Phụ trách",
                            ].map((label) => (
                                <th key={label} className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                                    {label}
                                </th>
                            ))}
                            <th className="w-16 px-4 py-3 text-right text-xs font-medium text-slate-500">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map((lead) => (
                            <tr
                                key={lead.id}
                                className="cursor-pointer border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                                onClick={() => onView(lead)}
                            >
                                <td className="px-4 py-4">
                                    <p className="text-sm font-medium text-slate-800">{lead.firstName} {lead.lastName}</p>
                                    <p className="mt-0.5 text-xs text-slate-400">{lead.company || "Chưa có công ty"}</p>
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-600">{lead.email}</td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{lead.phone}</td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                                    {getLeadSourceLabel(lead.source)}
                                </td>
                                <td className="whitespace-nowrap px-4 py-4"><StatusChip status={lead.status} /></td>
                                <td className="px-4 py-4">
                                    {lead.ownerName ? (
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-blue-600">
                                                {lead.ownerName.trim().charAt(0).toLocaleUpperCase("vi")}
                                            </div>
                                            <span className="whitespace-nowrap text-sm text-slate-600">{lead.ownerName}</span>
                                        </div>
                                    ) : <span className="text-sm text-slate-400">Chưa phân công</span>}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <IconButton size="small" aria-label={`Thao tác với ${lead.firstName} ${lead.lastName}`} onClick={(event) => openMenu(event, lead)}>
                                        <MoreHorizontal size={18} />
                                    </IconButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={() => setMenu(null)}>
                <MenuItem onClick={() => runAction(onView)}><Eye size={16} className="mr-2" /> Xem chi tiết</MenuItem>
                <MenuItem onClick={() => runAction(onEdit)}><Pencil size={16} className="mr-2" /> Chỉnh sửa</MenuItem>
                <MenuItem onClick={() => runAction(onDelete)} sx={{ color: "error.main" }}>
                    <Trash2 size={16} className="mr-2" /> Xóa
                </MenuItem>
            </Menu>
        </>
    );
}
