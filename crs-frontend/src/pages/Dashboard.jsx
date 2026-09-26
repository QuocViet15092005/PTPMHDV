import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Wallet, 
  Newspaper, 
  Pin,
  CalendarCheck,
  Users
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.studentId) {
          const profileRes = await api.get(`/students/${user.studentId}`);
          setProfile(profileRes.data);
        }
        
        // Fetch news for the dashboard panels
        const newsRes = await api.get('/news');
        setNews(newsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        setProfile({ fullName: 'Nguyễn Văn A', studentCode: user?.id });
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'ADMIN') {
      setProfile({ fullName: 'Quản trị viên', studentCode: 'ADMIN' });
      // Still fetch news for admin dashboard
      api.get('/news').then(res => setNews(res.data)).catch(err => console.error(err)).finally(() => setLoading(false));
    } else {
      fetchDashboardData();
    }
  }, [user]);

  const getCurrentDateFormatted = () => {
    const date = new Date();
    const days = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[date.getDay()];
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dayName}, ngày ${dd}/${mm}/${yyyy}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Chào buổi sáng';
    if (hour < 14) return 'Chào buổi trưa';
    if (hour < 18) return 'Chào buổi chiều';
    if (hour < 22) return 'Chào buổi tối';
    return 'Chào buổi đêm';
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  const tinNhaTruong = news.filter(n => n.category === 'Tin nhà trường').slice(0, 3);
  const tinDaoTao = news.filter(n => n.category === 'Tin đào tạo').slice(0, 3);

  return (
    <div className="animate-fade-in">
      {/* Banner */}
      <div className="dash-banner">
        <div>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{getGreeting()},</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem' }}>
            {profile?.fullName || user?.id}
          </h1>
          <div className="flex items-center gap-2" style={{ opacity: 0.9 }}>
            <Calendar size={18} />
            <span>{getCurrentDateFormatted()}</span>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '2rem', borderRadius: '24px' }}>
          <GraduationCap size={64} />
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {user?.role === 'ADMIN' ? (
          <>
            <div className="dash-card" onClick={() => navigate('/admin/courses')}>
              <div className="dash-icon-box" style={{ background: 'var(--primary)', color: 'white' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Đào tạo</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Quản lý Học phần</div>
              </div>
            </div>
            <div className="dash-card" onClick={() => navigate('/admin/students')}>
              <div className="dash-icon-box" style={{ background: '#f59e0b', color: 'white' }}>
                <Users size={24} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Hồ sơ</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Quản lý Sinh viên</div>
              </div>
            </div>
            <div className="dash-card" onClick={() => navigate('/admin/news')}>
              <div className="dash-icon-box" style={{ background: '#ef4444', color: 'white' }}>
                <Newspaper size={24} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Truyền thông</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Quản lý Tin tức</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="dash-card" onClick={() => navigate('/courses')}>
              <div className="dash-icon-box" style={{ background: 'var(--primary)', color: 'white' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Học tập</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Đăng ký học</div>
              </div>
            </div>
            <div className="dash-card" onClick={() => navigate('/schedule')}>
              <div className="dash-icon-box" style={{ background: '#f59e0b', color: 'white' }}>
                <Calendar size={24} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Lịch</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Thời khóa biểu</div>
              </div>
            </div>
            <div className="dash-card" onClick={() => navigate('/finance')}>
              <div className="dash-icon-box" style={{ background: '#10b981', color: 'white' }}>
                <Wallet size={24} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Tài chính</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Học phí</div>
              </div>
            </div>
            <div className="dash-card" onClick={() => navigate('/news')}>
              <div className="dash-icon-box" style={{ background: '#ef4444', color: 'white' }}>
                <Newspaper size={24} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Thông tin</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Tin tức & thông báo</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* News Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="dash-panel">
          <div className="dash-panel-header">
            TIN NHÀ TRƯỜNG
            <button className="btn btn-secondary" onClick={() => navigate('/news')} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', borderRadius: '99px' }}>Xem tất cả</button>
          </div>
          <div className="dash-panel-content flex flex-col gap-4">
            {tinNhaTruong.length === 0 ? <div className="text-muted">Chưa có tin nào</div> : tinNhaTruong.map((n, idx) => (
              <div key={n.id} className="flex gap-3" style={idx > 0 ? { borderTop: '1px solid var(--border)', paddingTop: '1rem' } : {}}>
                <Pin className="text-primary mt-1" size={18} style={n.pinned ? { transform: 'rotate(45deg)' } : { opacity: 0.2 }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{n.title}</div>
                  <div className="text-muted mt-1 flex items-center gap-1" style={{ fontSize: '0.8rem' }}><Calendar size={12} /> {n.publishedDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">
            TIN ĐÀO TẠO
            <button className="btn btn-secondary" onClick={() => navigate('/news')} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', borderRadius: '99px' }}>Xem tất cả</button>
          </div>
          <div className="dash-panel-content flex flex-col gap-4">
            {tinDaoTao.length === 0 ? <div className="text-muted">Chưa có tin nào</div> : tinDaoTao.map((n, idx) => (
              <div key={n.id} className="flex gap-3" style={idx > 0 ? { borderTop: '1px solid var(--border)', paddingTop: '1rem' } : {}}>
                <Pin className="text-primary mt-1" size={18} style={n.pinned ? { transform: 'rotate(45deg)' } : { opacity: 0.2 }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{n.title}</div>
                  <div className="text-muted mt-1 flex items-center gap-1" style={{ fontSize: '0.8rem' }}><Calendar size={12} /> {n.publishedDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">HOẠT ĐỘNG SINH VIÊN</div>
          <div className="dash-panel-content flex items-center justify-center flex-col text-muted py-8">
            <Newspaper size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <div style={{ fontSize: '0.9rem' }}>Chưa có tin nào</div>
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">SỰ KIỆN SẮP TỚI</div>
          <div className="dash-panel-content flex items-center justify-center flex-col text-muted py-8">
            <CalendarCheck size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <div style={{ fontSize: '0.9rem' }}>Chưa có sự kiện nào</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
