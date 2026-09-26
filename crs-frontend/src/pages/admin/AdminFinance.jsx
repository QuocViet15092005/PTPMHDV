import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Wallet, Search, Eye, Plus, X, User } from 'lucide-react';

const AdminFinance = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState({ registrations: [], transactions: [] });
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [payAmount, setPayAmount] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students');
      // res.data is ApiResponse, data is in res.data.data
      setStudents(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Lỗi khi tải sinh viên', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openFinanceModal = async (student) => {
    setSelectedStudent(student);
    setShowModal(true);
    setLoadingDetails(true);
    setPayAmount('');
    try {
      // Fetch registrations and transactions concurrently
      const [regRes, transRes] = await Promise.all([
        api.get(`/registrations/student/${student.id}`),
        api.get(`/transactions/student/${student.id}`)
      ]);
      setStudentDetails({
        registrations: regRes.data || [],
        transactions: transRes.data || []
      });
    } catch (err) {
      console.error('Lỗi lấy chi tiết', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!payAmount || isNaN(payAmount) || Number(payAmount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    try {
      await api.post('/transactions', {
        studentId: selectedStudent.id.toString(),
        type: `Sinh viên ${selectedStudent.fullName} nộp học phí`,
        amount: Number(payAmount),
        status: 'Thành công'
      });
      // Refresh details
      const transRes = await api.get(`/transactions/student/${selectedStudent.id}`);
      setStudentDetails(prev => ({ ...prev, transactions: transRes.data }));
      setPayAmount('');
      alert('Thêm giao dịch thành công!');
    } catch (err) {
      alert('Lỗi khi thêm giao dịch');
      console.error(err);
    }
  };

  const calculateFinance = () => {
    const totalCredits = studentDetails.registrations.reduce((sum, r) => sum + (r.course?.credits || 0), 0);
    const totalFee = totalCredits * 450000;
    const totalPaid = studentDetails.transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const debt = totalFee - totalPaid;
    return { totalCredits, totalFee, totalPaid, debt: debt > 0 ? debt : 0 };
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const filteredStudents = students.filter(s => 
    s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Quản lý Tài chính</h1>
          <p className="text-muted mt-1">Tra cứu học phí và thu tiền sinh viên</p>
        </div>
        <div className="flex items-center gap-2 surface px-3 py-2 rounded-lg" style={{ minWidth: '300px' }}>
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Tìm theo mã SV hoặc tên..." 
            className="w-full bg-transparent border-none outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="surface table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Mã SV</th>
              <th>Họ và tên</th>
              <th>Lớp</th>
              <th>Khoa</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8">Đang tải...</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8">Không tìm thấy sinh viên</td></tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id}>
                  <td style={{ fontWeight: '500' }}>{student.studentCode}</td>
                  <td>{student.fullName}</td>
                  <td>{student.className}</td>
                  <td>{student.department}</td>
                  <td className="text-center">
                    <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => openFinanceModal(student)}>
                      <Wallet size={16} /> Quản lý học phí
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="surface" style={{ width: '100%', maxWidth: '800px', padding: '2rem', borderRadius: '12px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={24} className="text-primary"/> Chi tiết Học phí - {selectedStudent?.fullName} ({selectedStudent?.studentCode})
            </h2>

            {loadingDetails ? (
              <div className="text-center py-8">Đang tải dữ liệu học phí...</div>
            ) : (
              <>
                {(() => {
                  const stats = calculateFinance();
                  return (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 rounded-lg bg-black/20 border border-[var(--border)] text-center">
                          <div className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>Tổng tín chỉ ĐK</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.totalCredits} TC</div>
                        </div>
                        <div className="p-4 rounded-lg bg-black/20 border border-[var(--border)] text-center">
                          <div className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>Tổng học phí</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3b82f6' }}>{formatMoney(stats.totalFee)}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-black/20 border border-[var(--border)] text-center">
                          <div className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>Đã nộp</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>{formatMoney(stats.totalPaid)}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-black/20 border border-[var(--border)] text-center">
                          <div className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>Còn nợ</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: stats.debt > 0 ? '#ef4444' : '#10b981' }}>
                            {formatMoney(stats.debt)}
                          </div>
                        </div>
                      </div>

                      {stats.debt > 0 ? (
                        <div className="mb-6 p-4 rounded-lg border border-primary/30" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Thêm giao dịch thanh toán</h3>
                          <div className="flex gap-3">
                            <button 
                              onClick={async () => {
                                if (window.confirm(`Xác nhận thu toàn bộ học phí (${formatMoney(stats.debt)}) của sinh viên ${selectedStudent.fullName}?`)) {
                                  try {
                                    await api.post('/transactions', {
                                      studentId: selectedStudent.id.toString(),
                                      type: `Sinh viên ${selectedStudent.fullName} nộp học phí`,
                                      amount: stats.debt,
                                      status: 'Thành công'
                                    });
                                    const transRes = await api.get(`/transactions/student/${selectedStudent.id}`);
                                    setStudentDetails(prev => ({ ...prev, transactions: transRes.data }));
                                    alert('Thu tiền thành công!');
                                  } catch (err) {
                                    alert('Có lỗi xảy ra');
                                  }
                                }
                              }} 
                              className="btn btn-primary whitespace-nowrap"
                            >
                              <Plus size={18} /> Xác nhận thu toàn bộ ({formatMoney(stats.debt)})
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/30 text-success flex items-center justify-center gap-2 font-medium">
                          Sinh viên {selectedStudent?.fullName} đã hoàn thành toàn bộ nghĩa vụ học phí.
                        </div>
                      )}

                      <h3 style={{ fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Lịch sử giao dịch</h3>
                      {studentDetails.transactions.length === 0 ? (
                        <div className="text-center text-muted py-4">Chưa có giao dịch nào</div>
                      ) : (
                        <table className="table" style={{ fontSize: '0.9rem' }}>
                          <thead>
                            <tr>
                              <th>Mã GD</th>
                              <th>Ngày tháng</th>
                              <th>Nội dung</th>
                              <th className="text-right">Số tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentDetails.transactions.map(t => (
                              <tr key={t.id}>
                                <td style={{ fontWeight: 500 }}>{t.id}</td>
                                <td>{t.transactionDate}</td>
                                <td>{t.type}</td>
                                <td className="text-right font-bold text-success">+{formatMoney(t.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFinance;
