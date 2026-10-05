import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AlertTriangle } from "lucide-react";
import type { TicketOverviewData } from "../../types/analytics";
import { getTicketStatusLabel } from "../../utils/ticketOptions";
import type { TicketStatus } from "../../types/ticket";

const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#64748B"];

export default function TicketOverview({ data }: { data: TicketOverviewData }) {
    const chartData = data.statuses.map((item) => ({ ...item, name: getTicketStatusLabel(item.status as TicketStatus) }));
    return <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between"><div><h2 className="font-semibold text-slate-900">Ticket Overview</h2><p className="mt-1 text-xs text-slate-500">Phân bổ trạng thái hỗ trợ</p></div><div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"><AlertTriangle size={16} /> {data.urgentCount} Urgent</div></div>{chartData.every((item) => item.count === 0) ? <div className="flex h-64 items-center justify-center text-sm text-slate-400">Chưa có dữ liệu</div> : <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} dataKey="count" nameKey="name" cx="50%" cy="44%" innerRadius={50} outerRadius={80}>{chartData.map((item, index) => <Cell key={item.status} fill={COLORS[index]} />)}</Pie><Tooltip /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer></div>}</section>;
}
