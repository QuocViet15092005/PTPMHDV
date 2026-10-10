import { BookOpen, Calendar, UserCircle } from 'lucide-react';

export default function AuthShell({ children }) {
  return (
    <main className="auth-page">
      <header className="portal-brand">
        <img className="portal-emblem" src="/hunre-logo.png" alt="Logo Trường Đại học Tài nguyên và Môi trường Hà Nội" />
        <div><p>TRƯỜNG ĐẠI HỌC</p><h2>TÀI NGUYÊN VÀ MÔI TRƯỜNG HÀ NỘI</h2></div>
      </header>
      <div className="auth-intro">
        <h1>CỔNG THÔNG TIN SINH VIÊN</h1>
        <p>Đăng ký học phần và theo dõi thông tin học tập trực tuyến</p>
      </div>
      <div className="auth-content">
        <section className="auth-guide">
          <span className="portal-eyebrow">EDUPORTAL · DÀNH CHO SINH VIÊN</span>
          <h2>Đồng hành cùng<br />hành trình học tập</h2>
          <p>Truy cập các tiện ích học tập trong một cổng thông tin thống nhất.</p>
          <div className="auth-feature"><BookOpen aria-hidden="true" /><div><h3>Đăng ký học phần</h3><p>Tra cứu học phần và quản lý danh sách đã đăng ký.</p></div></div>
          <div className="auth-feature"><Calendar aria-hidden="true" /><div><h3>Theo dõi lịch học</h3><p>Xem thời khóa biểu và cập nhật thông tin đào tạo.</p></div></div>
          <div className="auth-feature"><UserCircle aria-hidden="true" /><div><h3>Thông tin sinh viên</h3><p>Tra cứu hồ sơ, kết quả học tập và học phí.</p></div></div>
        </section>
        {children}
      </div>
      <footer className="auth-footer">EduPortal · Hệ thống đăng ký học phần</footer>
    </main>
  );
}
