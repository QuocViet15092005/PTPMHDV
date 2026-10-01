import React, { useEffect, useState } from 'react';
import { CalendarDays, Edit2, Plus, Trash2, X } from 'lucide-react';
import api from '../../api/axios';

const emptyForm = { courseCode: '', courseName: '', examDate: '', startTime: '', durationMinutes: 90, room: '', notes: '' };
const formatDate = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString('vi-VN') : '';

const AdminExams = () => {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchExams = async () => {
    setLoading(true);
    try { const { data } = await api.get('/exams'); setExams(data); }
    catch (error) { console.error('Không tải được lịch thi', error); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchExams(); }, []);
  useEffect(() => {
    api.get('/courses')
      .then(({ data }) => setCourses(data))
      .catch(error => console.error('Không tải được danh sách học phần', error))
      .finally(() => setCoursesLoading(false));
  }, []);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = exam => {
    setEditId(exam.id);
    setForm({ courseCode: exam.courseCode, courseName: exam.courseName, examDate: exam.examDate, startTime: exam.startTime?.slice(0, 5), durationMinutes: exam.durationMinutes, room: exam.room, notes: exam.notes || '' });
    setShowModal(true);
  };
  const submit = async event => {
    event.preventDefault();
    const payload = { ...form, durationMinutes: Number(form.durationMinutes) };
    try {
      if (editId) await api.put(`/exams/admin/${editId}`, payload);
      else await api.post('/exams/admin', payload);
      setShowModal(false); await fetchExams();
    } catch (error) { alert('Lưu lịch thi thất bại. Vui lòng kiểm tra dữ liệu và thử lại.'); }
  };
  const remove = async id => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch thi này không?')) return;
    try { await api.delete(`/exams/admin/${id}`); await fetchExams(); }
    catch (error) { alert('Xóa lịch thi thất bại.'); }
  };

  const fields = [
    ['examDate', 'Ngày thi', 'date'],
    ['startTime', 'Giờ bắt đầu', 'time'], ['durationMinutes', 'Thời lượng (phút)', 'number'], ['room', 'Phòng thi', 'text'],
  ];
  return <div className={showModal ? '' : 'animate-fade-in'}>
    <div className="flex justify-between items-center mb-6"><div><h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Quản lý lịch thi</h1><p className="text-muted mt-1">Tạo, cập nhật và xóa lịch thi</p></div><button className="btn btn-primary" onClick={openAdd}><Plus size={18} />Thêm lịch thi</button></div>
    <div className="surface table-wrapper"><table className="table"><thead><tr><th>Mã học phần</th><th>Tên học phần</th><th>Ngày thi</th><th>Giờ thi</th><th>Thời lượng</th><th>Phòng</th><th>Thao tác</th></tr></thead>
      <tbody>{loading ? <tr><td colSpan="7" className="text-center py-8">Đang tải...</td></tr> : exams.length === 0 ? <tr><td colSpan="7" className="text-center py-8">Chưa có lịch thi</td></tr> : exams.map(exam => <tr key={exam.id}><td>{exam.courseCode}</td><td>{exam.courseName}</td><td><span className="flex items-center gap-1"><CalendarDays size={15} />{formatDate(exam.examDate)}</span></td><td>{exam.startTime?.slice(0, 5)}</td><td>{exam.durationMinutes} phút</td><td>{exam.room}</td><td><div className="flex gap-2"><button className="btn btn-secondary" onClick={() => openEdit(exam)} title="Chỉnh sửa"><Edit2 size={16} /></button><button className="btn btn-secondary" onClick={() => remove(exam.id)} title="Xóa"><Trash2 size={16} /></button></div></td></tr>)}</tbody>
    </table></div>
    {showModal && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', zIndex: 1000, padding: '1rem' }}><div className="surface" style={{ width: '100%', maxWidth: 620, margin: 'auto 0', padding: '2rem', borderRadius: 12, position: 'relative', maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto' }}>
      <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 0, cursor: 'pointer' }}><X size={22} /></button><h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{editId ? 'Chỉnh sửa lịch thi' : 'Thêm lịch thi'}</h2>
      <form onSubmit={submit}>
        <div className="form-group"><label className="form-label" htmlFor="courseCode">Học phần</label><select id="courseCode" className="form-input" required disabled={coursesLoading} value={form.courseCode} onChange={event => {
          const selected = courses.find(course => course.courseCode === event.target.value);
          setForm({ ...form, courseCode: selected?.courseCode || '', courseName: selected?.courseName || '' });
        }}><option value="">{coursesLoading ? 'Đang tải học phần...' : courses.length ? 'Chọn học phần' : 'Chưa có học phần'}</option>
          {form.courseCode && !courses.some(course => course.courseCode === form.courseCode) && <option value={form.courseCode}>{form.courseCode} - {form.courseName} (không còn trong danh sách)</option>}
          {courses.map(course => <option key={course.id} value={course.courseCode}>{course.courseCode} - {course.courseName}</option>)}
        </select></div>
        {fields.map(([key, label, type]) => <div className="form-group" key={key}><label className="form-label" htmlFor={key}>{label}</label><input id={key} className="form-input" type={type} min={key === 'durationMinutes' ? 1 : undefined} required value={form[key]} onChange={event => setForm({ ...form, [key]: event.target.value })} /></div>)}
        <div className="form-group"><label className="form-label" htmlFor="notes">Ghi chú</label><textarea id="notes" className="form-input" rows="3" value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} /></div>
        <div className="flex justify-end gap-2 mt-6"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button><button type="submit" className="btn btn-primary">{editId ? 'Cập nhật' : 'Lưu lịch thi'}</button></div>
      </form>
    </div></div>}
  </div>;
};

export default AdminExams;
