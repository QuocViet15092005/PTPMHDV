import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Newspaper, 
  UserCircle, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Wallet,
  LogOut,
  Search,
  ChevronDown
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'ADMIN' ? [
    { path: '/dashboard', label: 'Trang chủ', icon: <Home size={20} /> },
    { path: '/admin/news', label: 'Quản lý Tin tức', icon: <Newspaper size={20} /> },
    { path: '/admin/courses', label: 'Quản lý Học phần', icon: <BookOpen size={20} /> },
    { path: '/admin/students', label: 'Quản lý Sinh viên', icon: <UserCircle size={20} /> },
    { path: '/admin/finance', label: 'Quản lý Tài chính', icon: <Wallet size={20} /> },
  ] : [
    { path: '/dashboard', label: 'Trang chủ', icon: <Home size={20} /> },
    { path: '/news', label: 'Tin tức', icon: <Newspaper size={20} /> },
    { path: '/profile', label: 'Profile', icon: <UserCircle size={20} /> },
    { path: '/study', label: 'Góc học tập', icon: <GraduationCap size={20} /> },
    { path: '/courses', label: 'Đăng ký học phần', icon: <BookOpen size={20} /> },
    { path: '/my-courses', label: 'Học phần của tôi', icon: <BookOpen size={20} /> },
    { path: '/schedule', label: 'Thời khóa biểu', icon: <Calendar size={20} /> },
    { path: '/finance', label: 'Tài chính', icon: <Wallet size={20} /> },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <BookOpen className="text-primary" size={28} />
          <span>EduPortal</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="content-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <div className="search-bar">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Tìm kiếm thông tin" />
          </div>

          <div className="flex items-center gap-6">
            <div className="header-profile" onClick={() => navigate('/profile')}>
              <div className="avatar">
                <UserCircle size={28} />
              </div>
              <span style={{ fontWeight: 500 }}>{user?.id || 'Người dùng'}</span>
              <ChevronDown size={16} className="text-muted" />
            </div>
            
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="main-content">
          <div className="container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
