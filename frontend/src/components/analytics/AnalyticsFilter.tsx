import { CalendarDays } from "lucide-react";
import { useRef } from "react";
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
  const selectRef = useRef<HTMLSelectElement>(null);

  const handleWrapperClick = () => {
    try {
      selectRef.current?.showPicker?.();
    } catch {
      selectRef.current?.focus();
    }
  };

  return (
    <div className="crm-range-filter" onClick={handleWrapperClick}>
      <CalendarDays size={16} className="crm-range-filter__icon" aria-hidden="true" />
      <select
        ref={selectRef}
        aria-label="Khoảng thời gian"
        value={value}
        onChange={(event) => onChange(event.target.value as AnalyticsRange)}
        className="crm-range-filter__select"
      >
        {rangeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
