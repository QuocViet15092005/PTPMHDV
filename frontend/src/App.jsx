import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Courses from './pages/Courses';
import AdminCourses from './pages/AdminCourses';

function Navbar() {
  const location = useLocation();
  const isActive = (path) =>
    location.pathname === path
      ? 'text-white border-b-2 border-white'
      : 'text-blue-100 hover:text-white';

  return (
    <nav className="bg-slate-900 text-white px-6 py-3 flex items-center gap-6 shadow-lg">
      <Link to="/" className="flex items-center gap-2 font-bold text-lg">
        <span>📚</span> Course System
      </Link>
      <div className="flex gap-4 ml-8">
        <Link to="/" className={`pb-1 transition ${isActive('/')}`}>
          🎓 Tra cứu môn
        </Link>
        <Link to="/admin" className={`pb-1 transition ${isActive('/admin')}`}>
          👨‍💼 Quản trị
        </Link>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Courses />} />
        <Route path="/admin" element={<AdminCourses />} />
      </Routes>
    </BrowserRouter>
  );
}