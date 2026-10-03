import { Award } from "lucide-react";
import { formatVND } from "../../utils/currency";
import type { SalesPerformanceStat } from "../../types/analytics";

interface SalesPerformanceProps {
  data: SalesPerformanceStat[];
}

export default function SalesPerformance({ data }: SalesPerformanceProps) {
  return (
    <section className="dashboard-card dashboard-card--wide dashboard-card--table">
      <div className="dashboard-card__header">
        <div>
          <p className="dashboard-card__eyebrow">Đội ngũ kinh doanh</p>
          <h2>Hiệu suất bán hàng</h2>
        </div>
        <Award size={20} aria-hidden="true" />
      </div>

      {data.length === 0 ? (
        <div className="chart-empty">Chưa có dữ liệu hiệu suất.</div>
      ) : (
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
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
                  <td>
                    <span className={`performance-medal performance-medal--${index + 1}`}>
                      {index + 1}
                    </span>
                    {item.owner}
                  </td>
                  <td>{item.deals}</td>
                  <td>{item.wonDeals}</td>
                  <td>
                    <span className="conversion-pill">{item.conversionRate}%</span>
                  </td>
                  <td>{formatVND(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
