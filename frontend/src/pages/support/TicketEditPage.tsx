import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TicketForm } from '../../components/support/TicketForm';

export const TicketEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock data nạp vào form sửa
  const initialValues = {
    subject: 'Lỗi không xuất được báo cáo Excel hàng tháng',
    customerName: 'Nguyễn Văn A',
    priority: 'High',
    status: 'Open',
    description: 'Khách hàng phản hồi khi bấm vào nút "Xuất Excel" ở trang Báo cáo thì hệ thống báo lỗi 500 Server Error.'
  };

  const handleSubmit = (data: any) => {
    console.log(`Cập nhật Ticket ${id}:`, data);
    navigate(`/support/${id}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Chỉnh Sửa Ticket #{id}</h1>
        <p className="text-xs text-gray-500">Cập nhật nội dung hoặc trạng thái yêu cầu hỗ trợ</p>
      </div>

      <TicketForm 
        initialValues={initialValues} 
        onSubmit={handleSubmit} 
        onCancel={() => navigate(`/support/${id}`)} 
      />
    </div>
  );
};

export default TicketEditPage;