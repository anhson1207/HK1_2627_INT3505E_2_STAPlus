import React from "react";
import Card from "../shared/Card";

import type { DealItem } from "./DealTable";

interface DealDetailProps {
    deal: DealItem;
}

export const DealDetail: React.FC<DealDetailProps> = ({ deal }) => {
    return (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
                <Card>
                    <h2 className="mb-4 text-sm font-semibold text-(--crm-text)">
                        Thông tin cơ hội
                    </h2>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <p className="text-xs text-(--crm-text-muted)">
                                Mã cơ hội
                            </p>
                            <p className="mt-1 font-semibold text-(--crm-primary)">
                                {deal.dealNumber}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-(--crm-text-muted)">
                                Tên cơ hội
                            </p>
                            <p className="mt-1 font-medium text-(--crm-heading)">
                                {deal.name}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-(--crm-text-muted)">
                                Khách hàng
                            </p>
                            <p className="mt-1 text-(--crm-heading)">
                                {deal.customerName}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-(--crm-text-muted)">
                                Người phụ trách
                            </p>
                            <p className="mt-1 text-(--crm-heading)">
                                {deal.assignee}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="mb-4 text-sm font-semibold text-(--crm-text)">
                        Tiến trình bán hàng
                    </h2>

                    <div className="h-2 overflow-hidden rounded-full bg-(--crm-surface-hover)">
                        <div
                            className="h-full rounded-full bg-(--crm-primary)"
                            style={{
                                width: `${deal.probability}%`,
                            }}
                        />
                    </div>

                    <div className="mt-2 flex justify-between text-xs text-(--crm-text-muted)">
                        <span>{deal.stage}</span>
                        <span>{deal.probability}%</span>
                    </div>
                </Card>
            </div>

            <Card>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-(--crm-text-secondary)">
                    Tổng quan
                </h2>

                <div className="space-y-4">
                    <div>
                        <p className="text-xs text-(--crm-text-muted)">
                            Giá trị cơ hội
                        </p>

                        <p className="mt-1 text-xl font-bold text-(--crm-heading)">
                            {deal.value.toLocaleString("vi-VN")} ₫
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-(--crm-text-muted)">
                            Giai đoạn
                        </p>

                        <p className="mt-1 text-sm font-medium text-(--crm-heading)">
                            {deal.stage}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-(--crm-text-muted)">
                            Cập nhật
                        </p>

                        <p className="mt-1 text-sm text-(--crm-text-secondary)">
                            {deal.updatedAt}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default DealDetail;
