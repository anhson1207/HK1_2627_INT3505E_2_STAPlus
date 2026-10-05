import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { LeadSourceStat } from "../../types/analytics";
import { getLeadSourceLabel } from "../../utils/constants";
import type { LeadSource } from "../../types/lead";

const COLORS = ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#64748B"];

export default function LeadSourceChart({ data }: { data: LeadSourceStat[] }) {
    const chartData = data.map((item) => ({ ...item, name: getLeadSourceLabel(item.source as LeadSource) }));
    return <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="mb-3"><h2 className="font-semibold text-slate-900">Lead Sources</h2><p className="mt-1 text-xs text-slate-500">Phân bổ nguồn Lead</p></div>{data.length === 0 ? <div className="flex h-72 items-center justify-center text-sm text-slate-400">Chưa có dữ liệu</div> : <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} dataKey="count" nameKey="name" cx="50%" cy="45%" innerRadius={55} outerRadius={88} paddingAngle={3}>{chartData.map((item, index) => <Cell key={item.source} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value) => [Number(value), "Lead"]} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer></div>}</section>;
}
