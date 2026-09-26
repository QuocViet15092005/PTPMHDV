import React, { useEffect, useState } from 'react';
import { Wallet, CheckCircle, AlertCircle, Clock, CreditCard } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const Finance = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.studentId) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/transactions/student/${user.studentId}`);
        setTransactions(res.data);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user]);

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
          <Wallet size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Tài chính & Học phí</h1>
          <p className="text-muted mt-1">Quản lý các khoản thu và lịch sử thanh toán</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="dash-panel" style={{ border: '1px solid var(--secondary)', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)' }}>
          <div className="dash-panel-header" style={{ borderBottomColor: 'rgba(16, 185, 129, 0.2)' }}>
            HỌC PHÍ HỌC KỲ HIỆN TẠI (HK1 2026-2027)
          </div>
          <div className="dash-panel-content flex flex-col items-center justify-center py-6">
            <div className="flex items-center gap-2 text-success mb-2" style={{ color: '#10b981' }}>
              <CheckCircle size={20} />
              <span style={{ fontWeight: 600 }}>Đã thanh toán đủ</span>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>0 đ</h2>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Bạn không có khoản nợ học phí nào cần thanh toán.</p>
            <button className="btn btn-secondary mt-6 flex items-center gap-2" disabled>
              <CreditCard size={18} />
              Thanh toán trực tuyến
            </button>
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">THÔNG TIN TÀI KHOẢN NGÂN HÀNG NHÀ TRƯỜNG</div>
          <div className="dash-panel-content">
            <div className="surface p-4 mb-4" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem' }} className="text-muted mb-1">Tên tài khoản</div>
              <div style={{ fontWeight: 'bold' }}>TRƯỜNG ĐẠI HỌC TÀI NGUYÊN VÀ MÔI TRƯỜNG HÀ NỘI</div>
            </div>
            <div className="surface p-4 mb-4" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem' }} className="text-muted mb-1">Số tài khoản</div>
              <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary)', letterSpacing: '2px' }}>1234 5678 9999</div>
            </div>
            <div className="surface p-4" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem' }} className="text-muted mb-1">Ngân hàng</div>
              <div style={{ fontWeight: 'bold' }}>Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank) - Chi nhánh Hà Nội</div>
            </div>
            <div className="mt-4 flex items-start gap-2 text-warning" style={{ color: '#fbbf24', fontSize: '0.85rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Nội dung chuyển khoản: [Mã Sinh Viên] - [Họ và Tên] - [Nộp học phí HK...]</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-panel">
        <div className="dash-panel-header">LỊCH SỬ GIAO DỊCH</div>
        <div className="dash-panel-content p-0" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Mã GD</th>
                <th>Thời gian</th>
                <th>Nội dung</th>
                <th style={{ textAlign: 'right' }}>Số tiền (VNĐ)</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 500 }}>{t.id}</td>
                  <td>
                    <div className="flex items-center gap-2 text-muted">
                      <Clock size={14} /> {t.transactionDate}
                    </div>
                  </td>
                  <td>{t.type}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{t.amount} đ</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-success">{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finance;
