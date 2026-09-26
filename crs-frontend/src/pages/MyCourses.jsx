import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { Trash2, AlertCircle } from 'lucide-react';

const MyCourses = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const res = await api.get(`/registrations/student/${user?.studentId}`);
      setRegistrations(res.data);
    } catch (error) {
      console.error('Failed to fetch my courses', error);
      // Mock data
      setRegistrations([
        { id: 'R1', courseId: 'C002', course: { courseCode: 'INT102', courseName: 'Cấu trúc Dữ liệu', credits: 3 }, status: 'CONFIRMED', registeredAt: '2024-09-10T14:30:00' },
        { id: 'R2', courseId: 'C003', course: { courseCode: 'INT201', courseName: 'Cơ sở dữ liệu', credits: 3 }, status: 'CONFIRMED', registeredAt: '2024-09-10T14:35:00' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy học phần này?')) return;
    
    setActionStatus({ type: 'info', message: 'Đang hủy đăng ký...' });
    try {
      await api.delete(`/registrations/${id}`);
      setActionStatus({ type: 'success', message: 'Đã hủy học phần thành công.' });
      fetchMyCourses();
    } catch (error) {
      setActionStatus({ type: 'error', message: 'Lỗi khi hủy học phần. Vui lòng thử lại.' });
    }
    
    setTimeout(() => setActionStatus({ type: '', message: '' }), 5000);
  };

  const totalCredits = registrations.reduce((sum, r) => sum + (r.course?.credits || 0), 0);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Học phần của tôi</h1>
          <p className="text-muted mt-1">Danh sách các học phần đã đăng ký thành công</p>
        </div>
        <div className="badge badge-primary" style={{ padding: '0.75rem 1rem', fontSize: '1rem' }}>
          Tổng số tín chỉ: <strong>{totalCredits}</strong>
        </div>
      </div>

      {actionStatus.message && (
        <div className={`badge ${actionStatus.type === 'success' ? 'badge-success' : actionStatus.type === 'error' ? 'badge-danger' : 'badge-primary'} w-full mb-6 flex items-center gap-2`} style={{ padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          {actionStatus.message}
        </div>
      )}

      <div className="surface table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Mã HP</th>
              <th>Tên học phần</th>
              <th>Số TC</th>
              <th>Trạng thái</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center text-muted py-8">Đang tải dữ liệu...</td></tr>
            ) : registrations.length === 0 ? (
              <tr><td colSpan="6" className="text-center text-muted py-8">Bạn chưa đăng ký học phần nào.</td></tr>
            ) : (
              registrations.map(reg => (
                <tr key={reg.id}>
                  <td style={{ fontWeight: '500' }}>{reg.course?.courseCode}</td>
                  <td>{reg.course?.courseName}</td>
                  <td>{reg.course?.credits}</td>
                  <td>
                    <span className="badge badge-success">Thành công</span>
                  </td>
                  <td className="text-center">
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      onClick={() => handleCancelRegistration(reg.id)}
                    >
                      <Trash2 size={16} /> Hủy
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyCourses;
