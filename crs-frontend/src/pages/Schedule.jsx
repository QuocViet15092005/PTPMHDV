import React from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

const Schedule = () => {
  const { user } = useAuth();
  const [scheduleData, setScheduleData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // In a real app, you'd fetch this from the backend
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const periods = [
    { id: 1, time: '07:00 - 07:50' },
    { id: 2, time: '07:50 - 08:40' },
    { id: 3, time: '08:50 - 09:40' },
    { id: 4, time: '09:40 - 10:30' },
    { id: 5, time: '10:40 - 11:30' },
    { id: 6, time: '13:00 - 13:50' },
    { id: 7, time: '13:50 - 14:40' },
    { id: 8, time: '14:50 - 15:40' },
    { id: 9, time: '15:40 - 16:30' },
    { id: 10, time: '16:40 - 17:30' }
  ];

  React.useEffect(() => {
    const fetchSchedule = async () => {
      try {
        if (!user?.studentId) return;
        setLoading(true);
        const res = await api.get(`/registrations/student/${user.studentId}`);
        const mappedData = res.data.map(reg => {
          const c = reg.course;
          return {
            day: c.dayOfWeek - 2, // Backend dayOfWeek (2-7) to frontend dayIndex (0-5)
            startPeriod: c.startPeriod,
            endPeriod: c.endPeriod,
            course: `${c.courseCode} - ${c.courseName}`,
            room: 'TBD' // Add real room field if available in DB
          };
        });
        setScheduleData(mappedData);
      } catch (err) {
        console.error('Failed to fetch schedule', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [user]);

  const getCellData = (dayIndex, periodId) => {
    return scheduleData.find(s => s.day === dayIndex && periodId >= s.startPeriod && periodId <= s.endPeriod);
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div style={{ padding: '0.75rem', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
          <CalendarIcon size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Thời khóa biểu</h1>
          <p className="text-muted mt-1">Lịch học các học phần đã đăng ký trong tuần</p>
        </div>
      </div>

      <div className="surface overflow-x-auto" style={{ padding: '1.5rem' }}>
        <table className="table" style={{ minWidth: '800px', border: '1px solid var(--border)' }}>
          <thead>
            <tr>
              <th style={{ width: '120px', borderRight: '1px solid var(--border)', textAlign: 'center' }}>Tiết \ Thứ</th>
              {days.map(day => (
                <th key={day} style={{ textAlign: 'center', borderRight: '1px solid var(--border)', width: '14%' }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map(period => (
              <tr key={period.id}>
                <td style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold' }}>Tiết {period.id}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                    <Clock size={12} /> {period.time}
                  </div>
                </td>
                {days.map((_, dayIndex) => {
                  const cell = getCellData(dayIndex, period.id);
                  const isStart = cell && cell.startPeriod === period.id;
                  
                  if (cell && !isStart) {
                    return null; // Skip rendering cells that are spanned by a previous row
                  }

                  if (cell && isStart) {
                    const rowSpan = cell.endPeriod - cell.startPeriod + 1;
                    return (
                      <td key={dayIndex} rowSpan={rowSpan} style={{ 
                        borderRight: '1px solid var(--border)', 
                        borderBottom: '1px solid var(--border)', 
                        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(79, 70, 229, 0.05))',
                        verticalAlign: 'top',
                        padding: '1rem'
                      }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem' }}>{cell.course}</div>
                        <div className="badge badge-secondary" style={{ background: 'var(--surface)' }}>Phòng: {cell.room}</div>
                      </td>
                    );
                  }

                  return (
                    <td key={dayIndex} style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}></td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Schedule;
