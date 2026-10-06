import { ChevronRight, Crown } from "lucide-react";
import { formatVND } from "../../utils/currency";
import type { TopCustomer } from "../../types/analytics";

interface TopCustomersProps {
  data: TopCustomer[];
  onCustomerClick?: (customerId: number) => void;
}

export default function TopCustomers({ data, onCustomerClick }: TopCustomersProps) {
  return (
    <section className="crm-widget crm-widget--wide crm-widget--table crm-customers-widget">
      <div className="crm-widget__header">
        <div>
          <p className="crm-widget__eyebrow">Khách hàng</p>
          <h2>Khách hàng hàng đầu</h2>
        </div>
        <span className="crm-widget__icon crm-tone--amber"><Crown size={20} aria-hidden="true" /></span>
      </div>

      {data.length === 0 ? (
        <div className="chart-empty">Chưa có dữ liệu khách hàng.</div>
      ) : (
        <div className="crm-table-wrap">
          <table className="crm-table crm-table--widget crm-customers-table">
            <colgroup><col className="crm-col-customer" /><col /><col className="crm-col-count" /><col className="crm-col-value" /><col className="crm-col-actions" /></colgroup>
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
                  className={onCustomerClick ? "cursor-pointer" : undefined}
                  onClick={() => onCustomerClick?.(customer.customerId)}
                >
                  <td>
                    <div className="crm-person">
                      <span className={`customer-rank customer-rank--${index + 1}`}>{index + 1}</span>
                      {onCustomerClick ? <button type="button" className="crm-table__link crm-person__name" onClick={(event) => { event.stopPropagation(); onCustomerClick(customer.customerId); }}>{customer.customerName}</button> : <span className="crm-person__name">{customer.customerName}</span>}
                    </div>
                  </td>
                  <td><span className="crm-owner-name"><span className="crm-owner-dot" />{customer.ownerName}</span></td>
                  <td><span className="crm-count-badge">{customer.deals}</span></td>
                  <td><span className={`crm-money ${customer.wonValue > 0 ? "is-positive" : ""}`}>{formatVND(customer.wonValue)}</span></td>
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
