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
                <div className="mb-3 rounded-full bg-(--crm-surface-hover) p-4 text-(--crm-text-muted)">
                    <UserRoundSearch size={28} />
                </div>
                <p className="font-medium text-(--crm-text)">Không tìm thấy Lead</p>
                <p className="crm-page-description">Thử thay đổi từ khóa hoặc bộ lọc hiện tại.</p>
            </div>
        );
    }

    return (
        <>
            <div className="crm-table-wrap">
                <table className="crm-table">
                    <thead>
                        <tr className="border-b border-(--crm-border) bg-(--crm-surface-subtle)">
                            {[
                                "Tên Lead",
                                "Email",
                                "Số điện thoại",
                                "Nguồn",
                                "Trạng thái",
                                "Phụ trách",
                            ].map((label) => (
                                <th key={label} className="px-4 py-3 text-left text-xs font-medium text-(--crm-text-secondary)">
                                    {label}
                                </th>
                            ))}
                            <th className="w-16 px-4 py-3 text-right text-xs font-medium text-(--crm-text-secondary)">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map((lead) => (
                            <tr
                                key={lead.id}
                                className="cursor-pointer border-b border-(--crm-border-subtle) transition last:border-b-0 hover:bg-(--crm-surface-subtle)"
                                onClick={() => onView(lead)}
                            >
                                <td className="px-4 py-4">
                                    <p className="text-sm font-medium text-(--crm-heading)">{lead.firstName} {lead.lastName}</p>
                                    <p className="mt-0.5 text-xs text-(--crm-text-muted)">{lead.company || "Chưa có công ty"}</p>
                                </td>
                                <td className="px-4 py-4 text-sm text-(--crm-text-secondary)">{lead.email}</td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm text-(--crm-text-secondary)">{lead.phone}</td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm text-(--crm-text-secondary)">
                                    {getLeadSourceLabel(lead.source)}
                                </td>
                                <td className="whitespace-nowrap px-4 py-4"><StatusChip status={lead.status} /></td>
                                <td className="px-4 py-4">
                                    {lead.ownerName ? (
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--crm-info-soft) text-xs font-medium text-(--crm-primary)">
                                                {lead.ownerName.trim().charAt(0).toLocaleUpperCase("vi")}
                                            </div>
                                            <span className="whitespace-nowrap text-sm text-(--crm-text-secondary)">{lead.ownerName}</span>
                                        </div>
                                    ) : <span className="text-sm text-(--crm-text-muted)">Chưa phân công</span>}
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
