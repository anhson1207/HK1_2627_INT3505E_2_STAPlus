import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AlertTriangle } from "lucide-react";
import type { TicketOverviewData } from "../../types/analytics";
import { getTicketStatusLabel } from "../../utils/ticketOptions";
import type { TicketStatus } from "../../types/ticket";

const COLORS = ["var(--crm-primary)", "var(--crm-purple)", "var(--crm-green)", "var(--crm-text-secondary)"];

export default function TicketOverview({ data }: { data: TicketOverviewData }) {
    const chartData = data.statuses.map((item) => ({ ...item, name: getTicketStatusLabel(item.status as TicketStatus) }));
    return <section className="crm-widget crm-widget--half crm-card__body"><div className="flex items-start justify-between"><div><h2 className="font-semibold text-(--crm-heading)">Ticket Overview</h2><p className="mt-1 text-xs text-(--crm-text-secondary)">Phân bổ trạng thái hỗ trợ</p></div><div className="flex items-center gap-2 rounded-lg bg-(--crm-danger-soft) px-3 py-2 text-xs font-semibold text-(--crm-danger)"><AlertTriangle size={16} /> {data.urgentCount} Urgent</div></div>{chartData.every((item) => item.count === 0) ? <div className="flex h-64 items-center justify-center text-sm text-(--crm-text-muted)">Chưa có dữ liệu</div> : <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} dataKey="count" nameKey="name" cx="50%" cy="44%" innerRadius={50} outerRadius={80}>{chartData.map((item, index) => <Cell key={item.status} fill={COLORS[index]} />)}</Pie><Tooltip /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer></div>}</section>;
}
