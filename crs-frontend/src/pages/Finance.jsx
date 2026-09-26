import React, { useEffect, useState } from 'react';
import { Wallet, CheckCircle, AlertCircle, Clock, CreditCard } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const Finance = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    const fetchFinanceData = async () => {
      if (!user?.studentId) {
        setLoading(false);
        return;
      }
      try {
        const [transRes, regRes] = await Promise.all([
          api.get(`/transactions/student/${user.studentId}`),
          api.get(`/registrations/student/${user.studentId}`)
        ]);
        setTransactions(transRes.data);
        setRegistrations(regRes.data);
      } catch (error) {
        console.error('Failed to fetch finance data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFinanceData();
  }, [user]);

  const totalCredits = registrations.reduce((sum, r) => sum + (r.course?.credits || 0), 0);
  const totalFee = totalCredits * 450000;
  const totalPaid = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const debt = totalFee - totalPaid > 0 ? totalFee - totalPaid : 0;

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const openPaymentModal = () => {
    setPayAmount(debt);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payAmount || isNaN(payAmount) || Number(payAmount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Giả lập thời gian delay của cổng thanh toán thực tế (1.5 giây)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await api.post('/transactions', {
        studentId: user?.studentId?.toString(),
        type: 'Đã nộp học phí trực tuyến',
        amount: Number(payAmount),
        status: 'Thành công'
      });
      
      // Refresh dữ liệu
      const transRes = await api.get(`/transactions/student/${user.studentId}`);
      setTransactions(transRes.data);
      
      setShowPaymentModal(false);
      alert('Giao dịch thanh toán thành công!');
    } catch (err) {
      alert('Có lỗi xảy ra khi kết nối tới cổng thanh toán.');
    } finally {
      setIsProcessing(false);
    }
  };

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
        <div className="dash-panel" style={{ border: debt > 0 ? '1px solid #ef4444' : '1px solid var(--secondary)', boxShadow: debt > 0 ? '0 4px 20px rgba(239, 68, 68, 0.1)' : '0 4px 20px rgba(16, 185, 129, 0.1)' }}>
          <div className="dash-panel-header" style={{ borderBottomColor: debt > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)' }}>
            HỌC PHÍ HỌC KỲ HIỆN TẠI ({totalCredits} Tín chỉ)
          </div>
          <div className="dash-panel-content flex flex-col items-center justify-center py-6">
            {debt > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-2" style={{ color: '#ef4444' }}>
                  <AlertCircle size={20} />
                  <span style={{ fontWeight: 600 }}>Cần thanh toán</span>
                </div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#ef4444' }}>
                  {formatMoney(debt)}
                </h2>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Tổng: {formatMoney(totalFee)} - Đã nộp: {formatMoney(totalPaid)}</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-success mb-2" style={{ color: '#10b981' }}>
                  <CheckCircle size={20} />
                  <span style={{ fontWeight: 600 }}>Đã thanh toán đủ</span>
                </div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>0 đ</h2>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Bạn không có khoản nợ học phí nào cần thanh toán.</p>
              </>
            )}
            
            <button 
              className="btn btn-secondary mt-6 flex items-center gap-2" 
              disabled={debt === 0}
              onClick={openPaymentModal}
            >
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
              <span>Nội dung CK: {user?.id} - [Họ và Tên] - Nộp học phí</span>
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
                <th style={{ textAlign: 'right' }}>Số tiền</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-muted">Chưa có giao dịch nào</td></tr>
              ) : (
                transactions.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500 }}>{t.id}</td>
                    <td>
                      <div className="flex items-center gap-2 text-muted">
                        <Clock size={14} /> {t.transactionDate}
                      </div>
                    </td>
                    <td>{t.type}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>+{formatMoney(t.amount)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-success">{t.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div className="surface animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: '16px', position: 'relative', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={24} className="text-primary"/> Cổng thanh toán trực tuyến
            </h2>
            
            <form onSubmit={handlePaymentSubmit}>
              <div className="mb-4 p-4 rounded-lg bg-black/20 border border-[var(--border)] text-center">
                <div className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Số tiền cần thanh toán</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#ef4444' }}>
                  {formatMoney(debt)}
                </div>
              </div>

              <div className="form-group mb-6">
                <label className="form-label">Số tiền giao dịch</label>
                <input 
                  type="text" 
                  className="form-input text-danger font-bold text-lg" 
                  value={formatMoney(debt)}
                  disabled
                />
                <small className="text-muted mt-1 block">Bạn đang thanh toán toàn bộ số tiền còn nợ.</small>
              </div>

              <div className="form-group mb-6">
                <label className="form-label">Phương thức thanh toán</label>
                <div className="p-3 border border-primary rounded-lg flex items-center justify-between" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <div className="flex items-center gap-3">
                    <div style={{ width: '32px', height: '32px', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#005baa' }}>VN</div>
                    <span style={{ fontWeight: 600 }}>VNPAY QR</span>
                  </div>
                  <CheckCircle size={20} className="text-primary" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)} disabled={isProcessing}>
                  Hủy
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary flex items-center gap-2" 
                  disabled={isProcessing}
                  onClick={async () => {
                    setIsProcessing(true);
                    try {
                      await new Promise(resolve => setTimeout(resolve, 1500));
                      await api.post('/transactions', {
                        studentId: user?.studentId?.toString(),
                        type: 'Đã nộp học phí trực tuyến',
                        amount: debt,
                        status: 'Thành công'
                      });
                      const transRes = await api.get(`/transactions/student/${user.studentId}`);
                      setTransactions(transRes.data);
                      setShowPaymentModal(false);
                      alert('Giao dịch thanh toán thành công!');
                    } catch (err) {
                      alert('Có lỗi xảy ra khi kết nối tới cổng thanh toán.');
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                >
                  {isProcessing ? (
                    <>Đang xử lý...</>
                  ) : (
                    <>Xác nhận thanh toán</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
