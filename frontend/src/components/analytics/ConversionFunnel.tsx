import type { ConversionFunnelItem } from "../../types/analytics";

interface ConversionFunnelProps {
  data: ConversionFunnelItem[];
}

export default function ConversionFunnel({ data }: ConversionFunnelProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <section className="crm-widget crm-widget--half crm-card__body">
      <div className="crm-widget__header">
        <div>
          <p className="crm-widget__eyebrow">Chuyển đổi</p>
          <h2>Phễu chuyển đổi</h2>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="chart-empty">Chưa có dữ liệu chuyển đổi.</div>
      ) : (
        <div className="funnel-list">
          {data.map((item, index) => (
            <div className="funnel-item" key={item.label}>
              <div className="funnel-item__label">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
              <div className="funnel-track">
                <span
                  className={`funnel-fill funnel-fill--${index + 1}`}
                  style={{ width: `${Math.max(8, (item.value / maxValue) * 100)}%` }}
                />
              </div>
              <small>{index === 0 ? "Điểm bắt đầu" : `${item.conversionRate}% từ bước trước`}</small>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
