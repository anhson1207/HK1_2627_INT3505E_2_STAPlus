import React from "react";
import Table from "../shared/Table";

export interface DealItem {
    id: string;
    dealNumber: string;
    name: string;
    customerName: string;
    value: number;
    stage: "New" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";
    probability: number;
    assignee: string;
    updatedAt: string;
}

interface DealTableProps {
    deals: DealItem[];
    onRowClick: (id: string) => void;
}

export const DealTable: React.FC<DealTableProps> = ({
    deals,
    onRowClick,
}) => {
    const columns: {
        key: keyof DealItem;
        label: string;
    }[] = [
        {
            key: "dealNumber",
            label: "Mã cơ hội",
        },
        {
            key: "name",
            label: "Tên cơ hội",
        },
        {
            key: "customerName",
            label: "Khách hàng",
        },
        {
            key: "value",
            label: "Giá trị",
        },
        {
            key: "stage",
            label: "Giai đoạn",
        },
        {
            key: "probability",
            label: "Xác suất",
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

    return (
        <Table<DealItem>
            columns={columns}
            data={deals}
            onRowClick={(deal) => onRowClick(deal.id)}
        />
    );
};

export default DealTable;