import type { ReactNode } from "react";

export interface TableColumn<T> {
    key: keyof T;
    label: string;
    render?: (item: T) => ReactNode;
}

interface TableProps<T> {
    columns?: TableColumn<T>[];
    data?: T[];
    onRowClick?: (item: T) => void;
}

export default function Table<T>({
    columns,
    data,
    onRowClick,
}: TableProps<T>) {
    const safeColumns = Array.isArray(columns) ? columns : [];
    const safeData = Array.isArray(data) ? data : [];

    return (
        <div className="crm-board crm-table-wrap">
            <table className="crm-table">
                <thead className="border-b border-(--crm-border) bg-(--crm-surface-subtle)">
                    <tr>
                        {safeColumns.map((column) => (
                            <th
                                key={String(column.key)}
                                className="p-3 text-xs font-semibold uppercase text-(--crm-text-secondary)"
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-(--crm-border-subtle)">
                    {safeData.map((item, index) => (
                        <tr
                            key={index}
                            onClick={() => onRowClick?.(item)}
                            className={
                                onRowClick
                                    ? "cursor-pointer transition-colors hover:bg-(--crm-info-soft)/40"
                                    : ""
                            }
                        >
                            {safeColumns.map((column) => (
                                <td
                                    key={String(column.key)}
                                    className="p-3 text-(--crm-text)"
                                >
                                    {column.render
                                        ? column.render(item)
                                        : String(item[column.key] ?? "")}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
console.log("table");