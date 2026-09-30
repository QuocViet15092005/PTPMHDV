import React, { useEffect, useState } from 'react';
import { BellRing, CalendarDays, Clock, MapPin } from 'lucide-react';
import api from '../api/axios';

const formatDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('vi-VN') : '';
const daysUntilExam = value => {
  const examDay = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((examDay - today) / 86400000);
};

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const upcomingExams = exams
    .filter(exam => daysUntilExam(exam.examDate) >= 0 && daysUntilExam(exam.examDate) <= 7)
    .sort((a, b) => a.examDate.localeCompare(b.examDate));

  useEffect(() => {
    api.get('/exams')
      .then(({ data }) => setExams(data))
      .catch(() => setError('Không tải được lịch thi. Vui lòng thử lại sau.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div style={{ padding: '0.75rem', background: 'rgba(79, 70, 229, 0.1)', borderRadius: 12, color: 'var(--primary)' }}><CalendarDays size={24} /></div>
        <div><h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Lịch thi</h1><p className="text-muted mt-1">Lịch thi các học phần</p></div>
      </div>
      {!loading && !error && upcomingExams.length > 0 && <div className="surface mb-6" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--primary)' }}>
        <div className="flex items-center gap-2" style={{ fontWeight: 700, marginBottom: '.5rem' }}><BellRing size={18} className="text-primary" />Nhắc lịch thi trong 7 ngày tới</div>
        {upcomingExams.map(exam => {
          const days = daysUntilExam(exam.examDate);
          return <div key={exam.id} className="text-muted" style={{ marginTop: '.35rem' }}>
            {exam.courseCode} — {exam.courseName}: {days === 0 ? 'hôm nay' : `còn ${days} ngày`}, {formatDate(exam.examDate)} lúc {exam.startTime?.slice(0, 5)} · {exam.room}
          </div>;
        })}
      </div>}
      {loading ? <div className="surface text-center py-8">Đang tải lịch thi...</div>
        : error ? <div className="surface text-center py-8">{error}</div>
          : exams.length === 0 ? <div className="surface text-center py-8">Chưa có lịch thi được công bố.</div>
            : <div className="surface table-wrapper"><table className="table">
              <thead><tr><th>Mã học phần</th><th>Tên học phần</th><th>Ngày thi</th><th>Giờ thi</th><th>Thời lượng</th><th>Phòng</th><th>Ghi chú</th></tr></thead>
              <tbody>{exams.map(exam => <tr key={exam.id}>
                <td style={{ fontWeight: 600 }}>{exam.courseCode}</td><td>{exam.courseName}</td>
                <td><span className="flex items-center gap-1"><CalendarDays size={15} />{formatDate(exam.examDate)}</span></td>
                <td><span className="flex items-center gap-1"><Clock size={15} />{exam.startTime?.slice(0, 5)}</span></td>
                <td>{exam.durationMinutes} phút</td><td><span className="flex items-center gap-1"><MapPin size={15} />{exam.room}</span></td><td>{exam.notes || '—'}</td>
              </tr>)}</tbody>
            </table></div>}
    </div>
  );
};

export default Exams;
