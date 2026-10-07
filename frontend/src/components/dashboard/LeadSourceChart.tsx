import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { LeadSourceStat } from "../../types/analytics";
import { getLeadSourceLabel } from "../../utils/constants";
import type { LeadSource } from "../../types/lead";

const COLORS = ["var(--crm-primary)", "var(--crm-purple)", "var(--crm-dark-blue)", "var(--crm-green)", "var(--crm-orange)", "var(--crm-text-secondary)"];

export default function LeadSourceChart({ data }: { data: LeadSourceStat[] }) {
    const chartData = data.map((item) => ({ ...item, name: getLeadSourceLabel(item.source as LeadSource) }));
    return <section className="crm-widget crm-widget--half crm-card__body"><div className="mb-3"><h2 className="font-semibold text-(--crm-heading)">Lead Sources</h2><p className="mt-1 text-xs text-(--crm-text-secondary)">Phân bổ nguồn Lead</p></div>{data.length === 0 ? <div className="flex h-72 items-center justify-center text-sm text-(--crm-text-muted)">Chưa có dữ liệu</div> : <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} dataKey="count" nameKey="name" cx="50%" cy="45%" innerRadius={55} outerRadius={88} paddingAngle={3}>{chartData.map((item, index) => <Cell key={item.source} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value) => [Number(value), "Lead"]} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer></div>}</section>;
}
