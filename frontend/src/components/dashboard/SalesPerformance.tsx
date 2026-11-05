import { Award } from "lucide-react";
import { formatVND } from "../../utils/currency";
import type { SalesPerformanceStat } from "../../types/analytics";

interface SalesPerformanceProps {
  data: SalesPerformanceStat[];
}

export default function SalesPerformance({ data }: SalesPerformanceProps) {
  return (
    <section className="crm-widget crm-widget--full crm-widget--table">
      <div className="crm-widget__header">
        <div>
          <h2>Hiệu suất bán hàng</h2>
        </div>
        <span className="crm-widget__icon crm-tone--purple"><Award size={20} aria-hidden="true" /></span>
      </div>

      {data.length === 0 ? (
        <div className="chart-empty">Chưa có dữ liệu hiệu suất.</div>
      ) : (
        <div className="crm-table-wrap">
          <table className="crm-table crm-table--widget crm-performance-table">
            <thead>
              <tr>
                <th style={{ width: "30%" }} className="text-left pl-6">Nhân viên</th>
                <th style={{ width: "15%" }} className="text-center">Tổng deal</th>
                <th style={{ width: "15%" }} className="text-center">Deal thắng</th>
                <th style={{ width: "22%" }} className="text-center">Tỉ lệ chuyển đổi</th>
                <th style={{ width: "18%" }} className="text-right pr-6">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.owner}>
                  <td className="text-left pl-6">
                    <div className="crm-person">
                      <span className={`performance-medal performance-medal--${index + 1}`}>
                        {index + 1}
                      </span>
                      <span className="crm-person__name">{item.owner}</span>
                    </div>
                  </td>
                  <td className="text-center"><span className="crm-count-badge">{item.deals}</span></td>
                  <td className="text-center"><span className={`crm-count-badge ${item.wonDeals > 0 ? "is-positive" : ""}`}>{item.wonDeals}</span></td>
                  <td className="text-center">
                    <div className="crm-conversion">
                      <span className="crm-conversion__track" aria-hidden="true"><span style={{ width: `${Math.min(100, Math.max(0, item.conversionRate))}%` }} /></span>
                      <span className={`conversion-pill ${item.conversionRate === 0 ? "is-zero" : ""}`}>{item.conversionRate}%</span>
                    </div>
                  </td>
                  <td className="text-right pr-6"><span className={`crm-money ${item.revenue > 0 ? "is-positive" : ""}`}>{formatVND(item.revenue)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
