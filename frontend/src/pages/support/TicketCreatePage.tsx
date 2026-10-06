
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketForm, type SupportTicketFormData } from '../../components/support/TicketForm';

export const TicketCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (data: SupportTicketFormData) => {
    console.log('Dữ liệu tạo Ticket mới:', data);
    // Sau khi lưu xong, quay lại trang danh sách Support
    navigate('/support');
  };

  return (
    <div className="p-6 bg-(--crm-surface-subtle) min-h-screen">
      <div className="mb-6">
        <h1 className="crm-page-title">Tạo Yêu Cầu Hỗ Trợ Mới</h1>
        <p className="text-xs text-(--crm-text-secondary)">Nhập thông tin chi tiết ticket theo chuẩn hệ thống Zoho CRM</p>
      </div>

      <TicketForm 
        onSubmit={handleSubmit} 
        onCancel={() => navigate('/support')} 
      />
    </div>
  );
};

export default TicketCreatePage;
