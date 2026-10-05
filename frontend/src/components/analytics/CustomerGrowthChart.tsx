import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CustomerGrowthStat } from "../../types/analytics";

interface CustomerGrowthChartProps {
  data: CustomerGrowthStat[];
}

export default function CustomerGrowthChart({ data }: CustomerGrowthChartProps) {
  return (
    <section className="dashboard-card">
      <div className="dashboard-card__header">
        <div>
          <p className="dashboard-card__eyebrow">Tăng trưởng</p>
          <h2>Khách hàng mới</h2>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="chart-empty">Chưa có dữ liệu tăng trưởng.</div>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }} />
              <Line
                type="monotone"
                dataKey="customers"
                name="Khách hàng mới"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4, fill: "#ffffff", strokeWidth: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
