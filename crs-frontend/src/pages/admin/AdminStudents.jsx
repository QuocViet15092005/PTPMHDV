import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    studentCode: '',
    fullName: '',
    dateOfBirth: '',
    gender: 'Nam',
    email: '',
    phone: '',
    className: '',
    status: 'ACTIVE'
  });

  const [editId, setEditId] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Lỗi khi tải sinh viên', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setFormData({
      studentCode: '',
      fullName: '',
      dateOfBirth: '',
      gender: 'Nam',
      email: '',
      phone: '',
      className: '',
      status: 'ACTIVE'
    });
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditId(student.id);
    setFormData({
      studentCode: student.studentCode || '',
      fullName: student.fullName || '',
      dateOfBirth: student.dateOfBirth || '',
      gender: student.gender || 'Nam',
      email: student.email || '',
      phone: student.phone || '',
      className: student.className || '',
      status: student.status || 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/students/${editId}`, formData);
      } else {
        await api.post('/students', formData);
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      alert(editId ? 'Cập nhật thất bại!' : 'Thêm sinh viên thất bại!');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sinh viên này không?')) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
      } catch (err) {
        alert('Xóa thất bại!');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Quản lý Sinh viên</h1>
          <p className="text-muted mt-1">Trang dành cho giáo vụ / quản trị viên</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Thêm Sinh viên
        </button>
      </div>

      <div className="surface table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Mã SV</th>
              <th>Họ và Tên</th>
              <th>Lớp</th>
              <th>Email</th>
              <th>Trạng thái</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8">Đang tải...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8">Không có dữ liệu</td></tr>
            ) : (
              students.map(student => (
                <tr key={student.id}>
                  <td style={{ fontWeight: '500' }}>{student.studentCode}</td>
                  <td>{student.fullName}</td>
                  <td>{student.className}</td>
                  <td>{student.email}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.875rem',
                      backgroundColor: student.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: student.status === 'ACTIVE' ? '#10b981' : '#ef4444'
                    }}>
                      {student.status === 'ACTIVE' ? 'Đang học' : 'Nghỉ học'}
                    </span>
                  </td>
                  <td className="text-center flex justify-center gap-2">
                    <button className="btn btn-secondary" style={{ padding: '0.4rem', color: '#10b981' }} onClick={() => openEditModal(student)} title="Chỉnh sửa">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem', color: '#ef4444' }} onClick={() => handleDelete(student.id)} title="Xóa">
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{editId ? 'Chỉnh sửa Sinh viên' : 'Thêm Sinh viên mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="form-group">
                  <label className="form-label">Mã sinh viên</label>
                  <input type="text" className="form-input" value={formData.studentCode} onChange={e => setFormData({...formData, studentCode: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Họ và Tên</label>
                  <input type="text" className="form-input" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày sinh</label>
                  <input type="date" className="form-input" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Giới tính</label>
                  <select className="form-input" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Lớp</label>
                  <input type="text" className="form-input" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input type="text" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select className="form-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="ACTIVE">Đang học</option>
                    <option value="INACTIVE">Nghỉ học</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Cập nhật' : 'Lưu sinh viên'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
