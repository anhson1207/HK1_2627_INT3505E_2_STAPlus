import { ChevronRight, Crown } from "lucide-react";
import { formatVND } from "../../utils/currency";
import type { TopCustomer } from "../../types/analytics";

interface TopCustomersProps {
  data: TopCustomer[];
  onCustomerClick?: (customerId: number) => void;
}

export default function TopCustomers({ data, onCustomerClick }: TopCustomersProps) {
  return (
    <section className="dashboard-card dashboard-card--table">
      <div className="dashboard-card__header">
        <div>
          <p className="dashboard-card__eyebrow">Khách hàng</p>
          <h2>Khách hàng hàng đầu</h2>
        </div>
        <Crown size={20} aria-hidden="true" />
      </div>

      {data.length === 0 ? (
        <div className="chart-empty">Chưa có dữ liệu khách hàng.</div>
      ) : (
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Phụ trách</th>
                <th>Deal</th>
                <th>Giá trị thắng</th>
                <th aria-label="Thao tác" />
              </tr>
            </thead>
            <tbody>
              {data.map((customer, index) => (
                <tr
                  key={customer.customerId}
                  className={onCustomerClick ? "dashboard-table__clickable" : undefined}
                  onClick={() => onCustomerClick?.(customer.customerId)}
                >
                  <td>
                    <span className="customer-rank">#{index + 1}</span>
                    {customer.customerName}
                  </td>
                  <td>{customer.ownerName}</td>
                  <td>{customer.deals}</td>
                  <td>{formatVND(customer.wonValue)}</td>
                  <td>{onCustomerClick && <ChevronRight size={17} aria-hidden="true" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
