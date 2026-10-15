import React, { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import api from '../../api/axios';

const AdminGrades = () => {
  const [registrations, setRegistrations] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rowMessages, setRowMessages] = useState({});
  const [saving, setSaving] = useState({});
  const [keyword, setKeyword] = useState('');
  const [courseId, setCourseId] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/registrations/grades').then(({ data }) => {
      if (!active) return;
      setRegistrations(data);
      setDrafts(Object.fromEntries(data.map(row => [row.id, row.score ?? ''])));
    }).catch(err => {
      if (active) setError(err.response?.data?.message || 'Không tải được danh sách. Vui lòng thử lại.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const saveGrade = async (event, row) => {
    event.preventDefault();
    if (saving[row.id]) return;
    const value = String(drafts[row.id] ?? '').trim();
    const score = Number(value);
    if (!value || !/^\d+(\.\d)?$/.test(value) || score < 0 || score > 10) {
      setRowMessages(previous => ({ ...previous, [row.id]: { error: true, text: 'Nhập điểm từ 0 đến 10, tối đa một số thập phân.' } }));
      return;
    }
    setSaving(previous => ({ ...previous, [row.id]: true }));
    setRowMessages(previous => ({ ...previous, [row.id]: null }));
    try {
      const { data } = await api.put(`/registrations/${row.id}/grade`, { score });
      setRegistrations(previous => previous.map(item => item.id === row.id ? data : item));
      setDrafts(previous => ({ ...previous, [row.id]: data.score }));
      setRowMessages(previous => ({ ...previous, [row.id]: { text: 'Đã lưu điểm.' } }));
    } catch (err) {
      setRowMessages(previous => ({ ...previous, [row.id]: { error: true, text: err.response?.data?.message || 'Không lưu được điểm. Vui lòng thử lại.' } }));
    } finally {
      setSaving(previous => ({ ...previous, [row.id]: false }));
    }
  };

  const courses = [...new Map(registrations.map(row => [String(row.courseId), row.course?.courseName || `Học phần #${row.courseId}`])).entries()];
  const search = keyword.trim().toLocaleLowerCase('vi');
  const rows = registrations.filter(row => (!courseId || String(row.courseId) === courseId)
    && `${row.student?.fullName || ''} ${row.student?.studentCode || ''} ${row.studentId} ${row.course?.courseCode || ''} ${row.course?.courseName || ''}`.toLocaleLowerCase('vi').includes(search));

  return (
    <div className="animate-fade-in">
      <h1 className="flex items-center gap-3" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}><GraduationCap /> Quản lý điểm</h1>
      <p className="text-muted mt-2 mb-6">Nhập hoặc sửa điểm tổng kết cho học phần sinh viên đã đăng ký. Học phần đã hủy không xuất hiện trong danh sách.</p>
      <div className="surface p-4 mb-6" style={{ padding: '1rem' }}>
        <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px' }}>
            <label className="form-label" htmlFor="grade-search">Tìm sinh viên hoặc học phần</label>
            <input id="grade-search" className="form-input" value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="Mã sinh viên, họ tên, tên học phần..." />
          </div>
          <div style={{ flex: '1 1 240px' }}>
            <label className="form-label" htmlFor="grade-course">Học phần</label>
            <select id="grade-course" className="form-input" value={courseId} onChange={event => setCourseId(event.target.value)}>
              <option value="">Tất cả học phần</option>
              {courses.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </div>
        </div>
        <p className="text-muted mt-4" style={{ fontSize: '0.85rem' }}>Quy đổi đang dùng: A từ 8.5; B+ từ 8; B từ 7; C+ từ 6.5; C từ 5.5; D+ từ 5; D từ 4; F dưới 4.</p>
      </div>
      {error && <div role="alert" className="surface p-4 mb-4" style={{ padding: '1rem', color: '#b91c1c' }}>{error}</div>}
      <div className="surface" style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead><tr><th>Sinh viên</th><th>Học phần</th><th>Tín chỉ</th><th>Điểm hệ 10</th><th>Điểm chữ</th><th>Điểm hệ 4</th><th>Nhập điểm</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="7">Đang tải danh sách...</td></tr> : rows.length === 0 ? <tr><td colSpan="7">{error ? 'Chưa tải được dữ liệu.' : 'Không có đăng ký phù hợp.'}</td></tr> : rows.map(row => (
              <tr key={row.id}>
                <td><div style={{ fontWeight: 600 }}>{row.student?.fullName || `Sinh viên #${row.studentId}`}</div><small className="text-muted">{row.student?.studentCode || 'Không tải được hồ sơ'}</small></td>
                <td><div>{row.course?.courseName || `Học phần #${row.courseId}`}</div><small className="text-muted">{row.course?.courseCode}</small></td>
                <td>{row.course?.credits ?? '—'}</td><td>{row.score ?? 'Chưa nhập'}</td><td>{row.letterGrade || '—'}</td><td>{row.gradePoint ?? '—'}</td>
                <td>
                  <form onSubmit={event => saveGrade(event, row)} style={{ minWidth: '190px' }}>
                    <div className="flex gap-2">
                      <input className="form-input" style={{ width: '85px' }} type="number" min="0" max="10" step="0.1" required aria-label={`Điểm cho ${row.student?.fullName || row.studentId}, ${row.course?.courseName || row.courseId}`} value={drafts[row.id] ?? ''} disabled={saving[row.id]} onChange={event => { setDrafts(previous => ({ ...previous, [row.id]: event.target.value })); setRowMessages(previous => ({ ...previous, [row.id]: null })); }} />
                      <button className="btn btn-primary" type="submit" disabled={saving[row.id]}>{saving[row.id] ? 'Đang lưu...' : 'Lưu điểm'}</button>
                    </div>
                    {rowMessages[row.id] && <small role={rowMessages[row.id].error ? 'alert' : 'status'} style={{ color: rowMessages[row.id].error ? '#b91c1c' : '#047857', display: 'block', marginTop: '0.5rem' }}>{rowMessages[row.id].text}</small>}
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminGrades;
