import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Edit2, Trash2, Users, X } from 'lucide-react';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    credits: 3,
    maxStudents: 40,
    dayOfWeek: 2,
    startPeriod: 1,
    endPeriod: 3
  });

  const [editId, setEditId] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      console.error('Lỗi khi tải học phần', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setFormData({
      courseCode: '',
      courseName: '',
      credits: 3,
      maxStudents: 40,
      dayOfWeek: 2,
      startPeriod: 1,
      endPeriod: 3
    });
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setEditId(course.id);
    setFormData({
      courseCode: course.courseCode,
      courseName: course.courseName,
      credits: course.credits,
      maxStudents: course.maxStudents,
      dayOfWeek: course.dayOfWeek,
      startPeriod: course.startPeriod,
      endPeriod: course.endPeriod
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/courses/${editId}`, formData);
      } else {
        await api.post('/courses', formData);
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      alert(editId ? 'Cập nhật thất bại!' : 'Thêm học phần thất bại! Có thể mã học phần đã tồn tại.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa học phần này không?')) {
      try {
        await api.delete(`/courses/${id}`);
        fetchCourses();
      } catch (err) {
        alert('Xóa thất bại!');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Quản lý Học phần</h1>
          <p className="text-muted mt-1">Trang dành cho giáo vụ / quản trị viên</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Thêm Học phần
        </button>
      </div>

      <div className="surface table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Mã HP</th>
              <th>Tên học phần</th>
              <th>Số TC</th>
              <th>Sĩ số</th>
              <th>Thời gian (Thứ-Tiết)</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8">Đang tải...</td></tr>
            ) : courses.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8">Không có dữ liệu</td></tr>
            ) : (
              courses.map(course => (
                <tr key={course.id}>
                  <td style={{ fontWeight: '500' }}>{course.courseCode}</td>
                  <td>{course.courseName}</td>
                  <td>{course.credits}</td>
                  <td>{course.maxStudents - course.remainingSeats} / {course.maxStudents}</td>
                  <td>Thứ {course.dayOfWeek}, Tiết {course.startPeriod}-{course.endPeriod}</td>
                  <td className="text-center flex justify-center gap-2">
                    <button className="btn btn-secondary" style={{ padding: '0.4rem', color: '#3b82f6' }} title="Xem danh sách SV">
                      <Users size={16} />
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem', color: '#10b981' }} onClick={() => openEditModal(course)} title="Chỉnh sửa">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem', color: '#ef4444' }} onClick={() => handleDelete(course.id)} title="Xóa">
                      <Trash2 size={16} />
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
          <div className="surface" style={{ width: '100%', maxWidth: '700px', padding: '2rem', borderRadius: '12px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{editId ? 'Chỉnh sửa Học phần' : 'Thêm Học phần mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="form-group">
                  <label className="form-label">Mã học phần</label>
                  <input type="text" className="form-input" value={formData.courseCode} onChange={e => setFormData({...formData, courseCode: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Tên học phần</label>
                  <input type="text" className="form-input" value={formData.courseName} onChange={e => setFormData({...formData, courseName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Số tín chỉ</label>
                  <input type="number" className="form-input" value={formData.credits} onChange={e => setFormData({...formData, credits: parseInt(e.target.value)})} min="1" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Sĩ số tối đa</label>
                  <input type="number" className="form-input" value={formData.maxStudents} onChange={e => setFormData({...formData, maxStudents: parseInt(e.target.value)})} min="1" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Thứ (2-8)</label>
                  <input type="number" className="form-input" value={formData.dayOfWeek} onChange={e => setFormData({...formData, dayOfWeek: parseInt(e.target.value)})} min="2" max="8" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Tiết BĐ (1-15)</label>
                  <input type="number" className="form-input" value={formData.startPeriod} onChange={e => setFormData({...formData, startPeriod: parseInt(e.target.value)})} min="1" max="15" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Tiết KT (1-15)</label>
                  <input type="number" className="form-input" value={formData.endPeriod} onChange={e => setFormData({...formData, endPeriod: parseInt(e.target.value)})} min="1" max="15" required />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Cập nhật' : 'Lưu học phần'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
