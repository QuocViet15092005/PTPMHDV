import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { Search, Filter, AlertCircle, PlusCircle } from 'lucide-react';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionStatus, setActionStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Assuming course-service API
      const res = await api.get('/courses?semester=HK1_2024');
      setCourses(res.data);
    } catch (error) {
      console.error('Failed to fetch courses', error);
      // Mock data for UI demonstration
      setCourses([
        { id: 'C001', courseCode: 'INT101', courseName: 'Nhập môn Lập trình', credits: 3, remainingSeats: 0, maxStudents: 40 },
        { id: 'C002', courseCode: 'INT102', courseName: 'Cấu trúc Dữ liệu', credits: 3, remainingSeats: 30, maxStudents: 45 },
        { id: 'C003', courseCode: 'INT201', courseName: 'Cơ sở dữ liệu', credits: 3, remainingSeats: 15, maxStudents: 40 },
        { id: 'C004', courseCode: 'INT301', courseName: 'Kiến trúc máy tính', credits: 4, remainingSeats: 0, maxStudents: 30 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (courseId) => {
    setActionStatus({ type: 'info', message: 'Đang xử lý đăng ký...' });
    try {
      // Call registration service API
      await api.post('/registrations', {
        studentId: user?.studentId,
        courseId: courseId
      });
      setActionStatus({ type: 'success', message: 'Đăng ký thành công!' });
      // Refresh list to update enrolled count
      fetchCourses();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra hoặc học phần đã đầy.';
      setActionStatus({ type: 'error', message: `Đăng ký thất bại: ${errorMsg}` });
    }
    
    // Clear message after 5 seconds
    setTimeout(() => setActionStatus({ type: '', message: '' }), 5000);
  };

  const filteredCourses = courses.filter(c => 
    c.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.courseCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Đăng ký học phần</h1>
          <p className="text-muted mt-1">Học kỳ 1 - Năm học 2024-2025</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="form-group mb-0" style={{ flex: 1, minWidth: '250px' }}>
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-muted" size={18} />
              <input 
                type="text" 
                className="form-input w-full" 
                style={{ paddingLeft: '2.5rem' }} 
                placeholder="Tìm kiếm mã hoặc tên HP..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.75rem 1rem' }}>
            <Filter size={18} />
          </button>
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
              <th>Sĩ số</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center text-muted py-8">Đang tải danh sách...</td></tr>
            ) : filteredCourses.length === 0 ? (
              <tr><td colSpan="6" className="text-center text-muted py-8">Không tìm thấy học phần nào.</td></tr>
            ) : (
              filteredCourses.map(course => {
                const isFull = course.remainingSeats <= 0;
                return (
                  <tr key={course.id}>
                    <td style={{ fontWeight: '500' }}>{course.courseCode}</td>
                    <td>{course.courseName}</td>
                    <td>{course.credits}</td>
                    <td>
                      <span className={`badge ${isFull ? 'badge-danger' : 'badge-success'}`}>
                        {course.maxStudents - course.remainingSeats} / {course.maxStudents}
                      </span>
                    </td>
                    <td className="text-center">
                      <button 
                        className={`btn ${isFull ? 'btn-secondary' : 'btn-primary'}`} 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        disabled={isFull}
                        onClick={() => handleRegister(course.id)}
                      >
                        {isFull ? 'Hết chỗ' : <><PlusCircle size={16} /> Đăng ký</>}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Courses;
