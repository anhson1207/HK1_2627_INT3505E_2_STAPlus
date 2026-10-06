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
    <section className="crm-widget crm-widget--half crm-card__body">
      <div className="crm-widget__header">
        <div>
          <p className="crm-widget__eyebrow">Tăng trưởng</p>
          <h2>Khách hàng mới</h2>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="chart-empty">Chưa có dữ liệu tăng trưởng.</div>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--crm-border-subtle)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--crm-text-secondary)", fontSize: 12 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--crm-text-secondary)", fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "var(--crm-radius-md)", borderColor: "var(--crm-border-subtle)" }} />
              <Line
                type="monotone"
                dataKey="customers"
                name="Khách hàng mới"
                stroke="var(--crm-primary)"
                strokeWidth={3}
                dot={{ r: 4, fill: "var(--crm-surface)", strokeWidth: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
