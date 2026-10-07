import React from "react";
import Table, { type TableColumn } from "../shared/Table";

export interface TicketItem {
    id: string;
    ticketNumber: string;
    subject: string;
    customerName: string;
    status: "Open" | "In Progress" | "On Hold" | "Closed";
    priority: "Low" | "Medium" | "High" | "Urgent";
    assignee: string;
    updatedAt: string;
}

interface TicketTableProps {
    tickets: TicketItem[];
    onRowClick: (id: string) => void;
}

const columns: TableColumn<TicketItem>[] = [
    {
        key: "ticketNumber",
        label: "Mã Ticket",
    },
    {
        key: "subject",
        label: "Tiêu đề",
    },
    {
        key: "customerName",
        label: "Khách hàng",
    },
    {
        key: "status",
        label: "Trạng thái",
    },
    {
        key: "priority",
        label: "Độ ưu tiên",
    },
    {
        key: "assignee",
        label: "Người phụ trách",
    },
    {
        key: "updatedAt",
        label: "Cập nhật",
    },
];

export const TicketTable: React.FC<TicketTableProps> = ({
    tickets,
    onRowClick,
}) => {
    return (
        <Table
            columns={columns}
            data={tickets}
            onRowClick={(ticket) => onRowClick(ticket.id)}
        />
    );
};

export default TicketTable;