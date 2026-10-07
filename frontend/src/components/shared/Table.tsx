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
        <div className="crm-board crm-table-wrap">
            <table className="crm-table">
                <thead className="border-b border-(--crm-border) bg-(--crm-surface-subtle)">
                    <tr>
                        {columns.map((column) => (
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
                    {data.map((item, index) => (
                        <tr
                            key={index}
                            onClick={() => onRowClick?.(item)}
                            className={
                                onRowClick
                                    ? "cursor-pointer transition-colors hover:bg-(--crm-info-soft)/40"
                                    : ""
                            }
                        >
                            {columns.map((column) => (
                                <td
                                    key={String(column.key)}
                                    className="p-3 text-(--crm-text)"
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
