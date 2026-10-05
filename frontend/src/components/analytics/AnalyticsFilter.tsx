import { CalendarDays } from "lucide-react";
import type { AnalyticsRange } from "../../types/analytics";

interface AnalyticsFilterProps {
  value: AnalyticsRange;
  onChange: (value: AnalyticsRange) => void;
}

const rangeOptions: Array<{ value: AnalyticsRange; label: string }> = [
  { value: "7d", label: "7 ngày qua" },
  { value: "30d", label: "30 ngày qua" },
  { value: "3m", label: "3 tháng qua" },
  { value: "6m", label: "6 tháng qua" },
  { value: "1y", label: "1 năm qua" },
];

export default function AnalyticsFilter({ value, onChange }: AnalyticsFilterProps) {
  return (
    <label className="analytics-filter">
      <CalendarDays size={17} aria-hidden="true" />
      <span className="sr-only">Khoảng thời gian</span>
      <select value={value} onChange={(event) => onChange(event.target.value as AnalyticsRange)}>
        {rangeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
