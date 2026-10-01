import React from "react";

export interface TableColumn<T> {
    key: keyof T;
    label: string;
}

interface TableProps<T> {
    columns: TableColumn<T>[];
    data: T[];
    onRowClick?: (item: T) => void;
}

export default function Table<T>({
    columns,
    data,
    onRowClick,
}: TableProps<T>) {
    return (
        <div className="w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
            <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={String(column.key)}
                                className="p-3 text-xs font-semibold uppercase text-gray-500"
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                    {data.map((item, index) => (
                        <tr
                            key={index}
                            onClick={() => onRowClick?.(item)}
                            className={
                                onRowClick
                                    ? "cursor-pointer transition-colors hover:bg-blue-50/40"
                                    : ""
                            }
                        >
                            {columns.map((column) => (
                                <td
                                    key={String(column.key)}
                                    className="p-3 text-gray-700"
                                >
                                    {String(item[column.key])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
