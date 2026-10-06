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
          <p className="crm-widget__eyebrow">Đội ngũ kinh doanh</p>
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
                <th>Nhân viên</th>
                <th>Tổng deal</th>
                <th>Deal thắng</th>
                <th>Tỉ lệ chuyển đổi</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.owner}>
                  <td><div className="crm-person">
                    <span className={`performance-medal performance-medal--${index + 1}`}>
                      {index + 1}
                    </span>
                    <span className="crm-person__name">{item.owner}</span>
                  </div></td>
                  <td><span className="crm-count-badge">{item.deals}</span></td>
                  <td><span className={`crm-count-badge ${item.wonDeals > 0 ? "is-positive" : ""}`}>{item.wonDeals}</span></td>
                  <td>
                    <div className="crm-conversion">
                      <span className="crm-conversion__track" aria-hidden="true"><span style={{ width: `${Math.min(100, Math.max(0, item.conversionRate))}%` }} /></span>
                      <span className={`conversion-pill ${item.conversionRate === 0 ? "is-zero" : ""}`}>{item.conversionRate}%</span>
                    </div>
                  </td>
                  <td><span className={`crm-money ${item.revenue > 0 ? "is-positive" : ""}`}>{formatVND(item.revenue)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
