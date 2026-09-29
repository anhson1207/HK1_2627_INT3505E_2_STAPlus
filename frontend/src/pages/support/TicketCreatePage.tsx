
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketForm } from '../../components/support/TicketForm';

export const TicketCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (data: any) => {
    console.log('Dữ liệu tạo Ticket mới:', data);
    // Sau khi lưu xong, quay lại trang danh sách Support
    navigate('/support');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Tạo Yêu Cầu Hỗ Trợ Mới</h1>
        <p className="text-xs text-gray-500">Nhập thông tin chi tiết ticket theo chuẩn hệ thống Zoho CRM</p>
      </div>

      <TicketForm 
        onSubmit={handleSubmit} 
        onCancel={() => navigate('/support')} 
      />
    </div>
  );
};

export default TicketCreatePage;