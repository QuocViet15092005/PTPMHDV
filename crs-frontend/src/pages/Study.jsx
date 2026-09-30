import React, { useEffect, useState } from 'react';
import { GraduationCap, BookOpen, Award, FileText, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const Study = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudyData = async () => {
      if (!user?.studentId) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/registrations/student/${user.studentId}`);
        setRegistrations(res.data);
      } catch (error) {
        console.error('Failed to fetch study data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudyData();
  }, [user]);

  const totalCredits = registrations.reduce((sum, r) => sum + (r.course?.credits || 0), 0);
  
  // Calculate mock GPA based on letterGrade if available
  const calculateGPA = () => {
    if (registrations.length === 0) return "0.0";
    let totalPoints = 0;
    let gradedCredits = 0;
    
    registrations.forEach(r => {
      if (r.letterGrade && r.course?.credits) {
        gradedCredits += r.course.credits;
        if (r.letterGrade === 'A') totalPoints += 4.0 * r.course.credits;
        else if (r.letterGrade === 'B+') totalPoints += 3.5 * r.course.credits;
        else if (r.letterGrade === 'B') totalPoints += 3.0 * r.course.credits;
        else if (r.letterGrade === 'C+') totalPoints += 2.5 * r.course.credits;
        else if (r.letterGrade === 'C') totalPoints += 2.0 * r.course.credits;
        else if (r.letterGrade === 'D+') totalPoints += 1.5 * r.course.credits;
        else if (r.letterGrade === 'D') totalPoints += 1.0 * r.course.credits;
      }
    });
    
    if (gradedCredits === 0) return "Chưa có";
    return (totalPoints / gradedCredits).toFixed(2);
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
          <GraduationCap size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Góc học tập</h1>
          <p className="text-muted mt-1">Quản lý kết quả học tập và tài liệu môn học</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="surface p-6" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
            <Award size={32} />
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Điểm trung bình (GPA)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{calculateGPA()} {calculateGPA() !== "Chưa có" && "/ 4.0"}</div>
          </div>
        </div>

        <div className="surface p-6" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: '#fbbf24' }}>
            <BookOpen size={32} />
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Số tín chỉ tích lũy</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalCredits} TC</div>
          </div>
        </div>

        <div className="surface p-6" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#8b5cf6' }}>
            <FileText size={32} />
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>Trạng thái học tập</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>Đang học</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dash-panel">
          <div className="dash-panel-header">KẾT QUẢ HỌC TẬP GẦN ĐÂY</div>
          <div className="dash-panel-content p-0" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Môn học</th>
                  <th style={{ textAlign: 'center' }}>Số TC</th>
                  <th style={{ textAlign: 'center' }}>Điểm chữ</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 ? (
                  <tr><td colSpan="3" className="text-center py-4 text-muted">Chưa có dữ liệu</td></tr>
                ) : (
                  registrations.map(r => (
                    <tr key={r.id}>
                      <td>{r.course?.courseName}</td>
                      <td style={{ textAlign: 'center' }}>{r.course?.credits}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: r.letterGrade ? '#10b981' : 'var(--text-muted)' }}>
                        {r.letterGrade || '--'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">TÀI LIỆU & BÀI GIẢNG</div>
          <div className="dash-panel-content flex flex-col gap-4">
            {registrations.length === 0 ? (
              <div className="text-center py-4 text-muted">Vui lòng đăng ký môn học để xem tài liệu</div>
            ) : (
              registrations.map(r => (
                <div key={r.id} className="surface p-4 flex items-center justify-between" style={{ padding: '1rem', cursor: 'pointer' }}>
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-primary" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Đề cương môn: {r.course?.courseName}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>PDF • Nhấn để tải về</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </div>
              )).slice(0, 4) // Show up to 4 items
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Study;
