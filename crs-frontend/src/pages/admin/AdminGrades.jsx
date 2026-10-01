import React, { useEffect, useMemo, useState } from 'react';
import { Award } from 'lucide-react';
import api from '../../api/axios';

const AdminGrades = () => {
  const [registrations, setRegistrations] = useState([]);
  const [scores, setScores] = useState({});
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/registrations');
      const active = data.filter(item => item.status !== 'CANCELLED');
      setRegistrations(active);
      setScores(Object.fromEntries(active.map(item => [item.id, item.numericScore ?? ''])));
    } catch (error) {
      console.error('Không tải được danh sách điểm', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchRegistrations(); }, []);

  const semesters = useMemo(() => [...new Set(registrations.map(item => item.course?.semester || 'Chưa xếp học kỳ'))].sort(), [registrations]);
  const visible = registrations.filter(item => semesterFilter === 'ALL' || (item.course?.semester || 'Chưa xếp học kỳ') === semesterFilter);

  const saveScore = async registration => {
    const value = scores[registration.id];
    if (value === '' || Number.isNaN(Number(value)) || Number(value) < 0 || Number(value) > 10) {
      alert('Điểm phải nằm trong khoảng từ 0 đến 10.');
      return;
    }
    setSavingId(registration.id);
    try {
      await api.patch(`/registrations/${registration.id}/grade`, { numericScore: Number(value) });
      await fetchRegistrations();
    } catch (error) {
      alert(error.response?.data?.message || 'Lưu điểm thất bại.');
    } finally {
      setSavingId(null);
    }
  };

  return <div className="animate-fade-in">
    <div className="flex justify-between items-center mb-6"><div><h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Quản lý điểm</h1><p className="text-muted mt-1">Nhập điểm hệ 10; hệ thống tự quy đổi điểm chữ</p></div>
      <select className="form-input" aria-label="Lọc theo học kỳ" style={{ maxWidth: 240 }} value={semesterFilter} onChange={event => setSemesterFilter(event.target.value)}><option value="ALL">Tất cả học kỳ</option>{semesters.map(term => <option key={term} value={term}>{term}</option>)}</select>
    </div>
    <div className="surface table-wrapper"><table className="table"><thead><tr><th>Sinh viên</th><th>Học phần</th><th>Học kỳ</th><th>Điểm hệ 10</th><th>Điểm chữ</th><th></th></tr></thead>
      <tbody>{loading ? <tr><td colSpan="6" className="text-center py-8">Đang tải...</td></tr> : visible.length === 0 ? <tr><td colSpan="6" className="text-center py-8">Chưa có đăng ký học phần</td></tr> : visible.map(item => <tr key={item.id}>
        <td>{item.student?.fullName || `ID ${item.studentId}`}<div className="text-muted" style={{ fontSize: '.8rem' }}>{item.student?.studentCode}</div></td>
        <td>{item.course?.courseName || 'Không còn dữ liệu học phần'}<div className="text-muted" style={{ fontSize: '.8rem' }}>{item.course?.courseCode}</div></td>
        <td>{item.course?.semester || 'Chưa xếp học kỳ'}</td>
        <td><input aria-label={`Điểm ${item.student?.studentCode || item.studentId} ${item.course?.courseCode || ''}`} className="form-input" type="number" min="0" max="10" step="0.01" style={{ width: 110 }} value={scores[item.id] ?? ''} onChange={event => setScores({ ...scores, [item.id]: event.target.value })} /></td>
        <td><span className="badge badge-primary">{item.letterGrade || '—'}</span></td>
        <td><button className="btn btn-primary" disabled={savingId === item.id} onClick={() => saveScore(item)}>{savingId === item.id ? 'Đang lưu...' : 'Lưu điểm'}</button></td>
      </tr>)}</tbody>
    </table></div>
    <div className="flex items-center gap-2 text-muted mt-4"><Award size={16} />Điểm chữ: A ≥ 8.5, B+ ≥ 8.0, B ≥ 7.0, C+ ≥ 6.5, C ≥ 5.5, D+ ≥ 5.0, D ≥ 4.0, F &lt; 4.0.</div>
  </div>;
};

export default AdminGrades;
