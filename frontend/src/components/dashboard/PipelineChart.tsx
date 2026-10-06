import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DealStageStat } from "../../types/analytics";
import { formatVND } from "../../utils/currency";
import { getDealStageLabel } from "../../utils/dealStage";
import type { DealStage } from "../../types/deal";

export default function PipelineChart({ data }: { data: DealStageStat[] }) {
    const chartData = data.map((item) => ({ ...item, valueMillions: item.value / 1_000_000, label: getDealStageLabel(item.stage as DealStage) }));
    return <section className="crm-widget  crm-card__body"><div className="mb-5"><h2 className="font-semibold text-(--crm-heading)">Deal Pipeline</h2><p className="mt-1 text-xs text-(--crm-text-secondary)">Số lượng và giá trị theo giai đoạn</p></div>{data.length === 0 ? <div className="flex h-72 items-center justify-center text-sm text-(--crm-text-muted)">Chưa có dữ liệu</div> : <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="var(--crm-border-subtle)" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--crm-text-secondary)" }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--crm-text-secondary)" }} axisLine={false} tickLine={false} /><Tooltip formatter={(value, name) => name === "count" ? [Number(value), "Số Deal"] : [formatVND(Number(value) * 1_000_000), "Giá trị"]} /><Bar dataKey="count" name="count" fill="var(--crm-primary)" radius={[5, 5, 0, 0]} /><Bar dataKey="valueMillions" name="valueMillions" fill="var(--crm-primary-soft)" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>}</section>;
}
