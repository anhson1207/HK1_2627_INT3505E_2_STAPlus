import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketTable,type  TicketItem } from '../../components/support/TicketTable';

const MOCK_DATA: TicketItem[] = [
  { id: '1', ticketNumber: '#TCK-101', subject: 'Lỗi đăng nhập hệ thống', customerName: 'Nguyễn Văn A', status: 'Open', priority: 'High', assignee: 'Kỹ Thuật A', updatedAt: '10 phút trước' },
  { id: '2', ticketNumber: '#TCK-102', subject: 'Yêu cầu xuất hóa đơn VAT', customerName: 'Công ty B', status: 'In Progress', priority: 'Medium', assignee: 'Kế Toán B', updatedAt: '2 giờ trước' }
];

export const SupportPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-(--crm-surface-subtle) min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="crm-page-title">Support Desk (Zoho View)</h1>
          <p className="text-xs text-(--crm-text-secondary)">Quản lý toàn bộ ticket yêu cầu hỗ trợ</p>
        </div>
        <button 
          onClick={() => navigate('/support/create')} 
          className="crm-btn crm-btn--primary"
        >
          + Tạo Ticket
        </button>
      </div>

      <TicketTable 
        tickets={MOCK_DATA} 
        onRowClick={(id) => navigate(`/support/${id}`)} 
      />
    </div>
  );
};
export default SupportPage;
