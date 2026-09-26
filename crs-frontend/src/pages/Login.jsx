import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const decodedUser = await login(formData);
      if (decodedUser?.role === 'ADMIN') {
        navigate('/admin/courses');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
      <div className="surface" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4 text-primary">
            <LogIn size={48} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Đăng nhập</h1>
          <p className="text-muted mt-2">Hệ thống Đăng ký Học phần</p>
        </div>

        {error && <div className="badge badge-danger w-full mb-4" style={{ padding: '0.75rem', borderRadius: '8px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên đăng nhập / MSSV</label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="Nhập mã sinh viên..."
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group mb-8">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full justify-center" disabled={isLoading}>
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-muted">Chưa có tài khoản? </span>
          <Link to="/register" className="text-primary" style={{ fontWeight: '500' }}>Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
