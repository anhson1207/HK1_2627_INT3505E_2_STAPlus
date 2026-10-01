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
                    <h2 className="mb-4 text-sm font-semibold text-gray-700">
                        Thông tin cơ hội
                    </h2>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <p className="text-xs text-gray-400">
                                Mã cơ hội
                            </p>
                            <p className="mt-1 font-semibold text-blue-600">
                                {deal.dealNumber}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400">
                                Tên cơ hội
                            </p>
                            <p className="mt-1 font-medium text-gray-800">
                                {deal.name}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400">
                                Khách hàng
                            </p>
                            <p className="mt-1 text-gray-800">
                                {deal.customerName}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400">
                                Người phụ trách
                            </p>
                            <p className="mt-1 text-gray-800">
                                {deal.assignee}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="mb-4 text-sm font-semibold text-gray-700">
                        Tiến trình bán hàng
                    </h2>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                                width: `${deal.probability}%`,
                            }}
                        />
                    </div>

                    <div className="mt-2 flex justify-between text-xs text-gray-400">
                        <span>{deal.stage}</span>
                        <span>{deal.probability}%</span>
                    </div>
                </Card>
            </div>

            <Card>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Tổng quan
                </h2>

                <div className="space-y-4">
                    <div>
                        <p className="text-xs text-gray-400">
                            Giá trị cơ hội
                        </p>

                        <p className="mt-1 text-xl font-bold text-gray-800">
                            {deal.value.toLocaleString("vi-VN")} ₫
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400">
                            Giai đoạn
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-800">
                            {deal.stage}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400">
                            Cập nhật
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                            {deal.updatedAt}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default DealDetail;