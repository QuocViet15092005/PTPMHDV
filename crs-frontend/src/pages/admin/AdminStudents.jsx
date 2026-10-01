import React, { useEffect, useState } from 'react';
import { Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import api from '../../api/axios';

const emptyForm = { studentCode: '', fullName: '', dateOfBirth: '', gender: '', email: '', phone: '', className: '', status: 'ACTIVE' };

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchStudents = async (search = keyword) => {
    setLoading(true);
    try {
      const { data } = await api.get('/students', { params: search.trim() ? { keyword: search.trim() } : {} });
      setStudents(data);
    } catch (error) {
      console.error('Không tải được danh sách sinh viên', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(''); }, []);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = student => {
    setEditId(student.id);
    setForm({ ...emptyForm, ...student, dateOfBirth: student.dateOfBirth || '' });
    setShowModal(true);
  };
  const submit = async event => {
    event.preventDefault();
    const payload = { ...form, dateOfBirth: form.dateOfBirth || null, phone: form.phone || null, className: form.className || null };
    try {
      if (editId) await api.put(`/students/${editId}`, payload);
      else await api.post('/students', payload);
      setShowModal(false);
      await fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || 'Lưu thông tin sinh viên thất bại. Vui lòng kiểm tra dữ liệu.');
    }
  };
  const remove = async student => {
    if (!window.confirm(`Bạn có chắc muốn xóa sinh viên ${student.fullName} (${student.studentCode}) không?`)) return;
    try { await api.delete(`/students/${student.id}`); await fetchStudents(); }
    catch (error) { alert('Xóa sinh viên thất bại.'); }
  };

  const fields = [
    ['studentCode', 'Mã sinh viên', 'text'], ['fullName', 'Họ và tên', 'text'], ['dateOfBirth', 'Ngày sinh', 'date'],
    ['email', 'Email', 'email'], ['phone', 'Số điện thoại', 'tel'], ['className', 'Lớp', 'text'],
  ];

  return <div className={showModal ? '' : 'animate-fade-in'}>
    <div className="flex justify-between items-center mb-6">
      <div><h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Quản lý sinh viên</h1><p className="text-muted mt-1">Danh sách và thông tin sinh viên</p></div>
      <button className="btn btn-primary" onClick={openAdd}><Plus size={18} />Thêm sinh viên</button>
    </div>

    <form className="surface flex items-center gap-2 mb-4" style={{ padding: '1rem' }} onSubmit={event => { event.preventDefault(); fetchStudents(); }}>
      <Search size={18} className="text-muted" />
      <input className="form-input" aria-label="Tìm sinh viên" placeholder="Tìm theo mã, họ tên hoặc lớp" value={keyword} onChange={event => setKeyword(event.target.value)} />
      <button type="submit" className="btn btn-secondary">Tìm kiếm</button>
    </form>

    <div className="surface table-wrapper"><table className="table">
      <thead><tr><th>Mã sinh viên</th><th>Họ và tên</th><th>Email</th><th>Lớp</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
      <tbody>{loading ? <tr><td colSpan="6" className="text-center py-8">Đang tải...</td></tr>
        : students.length === 0 ? <tr><td colSpan="6" className="text-center py-8">Không tìm thấy sinh viên</td></tr>
          : students.map(student => <tr key={student.id}>
            <td style={{ fontWeight: 600 }}>{student.studentCode}</td><td>{student.fullName}</td><td>{student.email}</td><td>{student.className || '—'}</td>
            <td><span className={`badge ${student.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{student.status}</span></td>
            <td><div className="flex gap-2"><button className="btn btn-secondary" title="Chỉnh sửa" onClick={() => openEdit(student)}><Edit2 size={16} /></button><button className="btn btn-secondary" title="Xóa" onClick={() => remove(student)}><Trash2 size={16} /></button></div></td>
          </tr>)}</tbody>
    </table></div>

    {showModal && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', zIndex: 1000, padding: '1rem' }}>
      <div className="surface" style={{ width: '100%', maxWidth: 640, margin: 'auto 0', padding: '2rem', borderRadius: 12, position: 'relative', maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto' }}>
        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 0, cursor: 'pointer' }}><X size={22} /></button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{editId ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên'}</h2>
        <form onSubmit={submit}>
          {fields.map(([key, label, type]) => <div className="form-group" key={key}><label className="form-label" htmlFor={key}>{label}</label><input id={key} className="form-input" type={type} required={['studentCode', 'fullName', 'email'].includes(key)} value={form[key]} onChange={event => setForm({ ...form, [key]: event.target.value })} /></div>)}
          <div className="form-group"><label className="form-label" htmlFor="gender">Giới tính</label><select id="gender" className="form-input" value={form.gender} onChange={event => setForm({ ...form, gender: event.target.value })}><option value="">Chưa cập nhật</option><option value="NAM">Nam</option><option value="NU">Nữ</option></select></div>
          <div className="form-group"><label className="form-label" htmlFor="status">Trạng thái</label><select id="status" className="form-input" value={form.status} onChange={event => setForm({ ...form, status: event.target.value })}><option value="ACTIVE">Đang học</option><option value="INACTIVE">Ngừng học</option></select></div>
          <div className="flex justify-end gap-2 mt-6"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button><button type="submit" className="btn btn-primary">{editId ? 'Cập nhật' : 'Lưu sinh viên'}</button></div>
        </form>
      </div>
    </div>}
  </div>;
};

export default AdminStudents;
