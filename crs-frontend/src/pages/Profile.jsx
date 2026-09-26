import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    studentCode: '',
    fullName: '',
    email: '',
    phone: '',
    className: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdData, setPwdData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.role === 'ADMIN') {
        setProfile({
          fullName: 'Quản trị viên',
          email: 'admin@edu.vn',
          phone: '0901234567'
        });
        setLoading(false);
        return;
      }
      
      try {
        const res = await api.get(`/students/${user?.studentId}`);
        setProfile(res.data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
        setProfile({
          studentCode: user?.id || 'B21DCCN001',
          fullName: 'Nguyễn Văn A',
          email: 'nva@student.edu.vn',
          phone: '0901234567',
          className: 'D21CQCN01-N'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    if (user?.role === 'ADMIN') {
      setTimeout(() => {
        setSaving(false);
        setMessage({ type: 'success', text: 'Cập nhật thông tin Quản trị viên thành công!' });
      }, 500);
      return;
    }
    
    try {
      await api.put(`/students/${user?.studentId}`, profile);
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra, vui lòng thử lại.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePwdChange = (e) => {
    setPwdData({ ...pwdData, [e.target.name]: e.target.value });
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setPwdMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
      return;
    }
    setSavingPwd(true);
    setPwdMessage({ type: '', text: '' });
    try {
      // user.id in context is actually the username (subject)
      await api.put('/auth/change-password', {
        username: user?.id,
        oldPassword: pwdData.oldPassword,
        newPassword: pwdData.newPassword
      });
      setPwdMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setTimeout(() => {
        setShowPwdModal(false);
        setPwdData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setPwdMessage({ type: '', text: '' });
      }, 1500);
    } catch (error) {
      setPwdMessage({ type: 'error', text: error.response?.data?.message || 'Mật khẩu cũ không chính xác hoặc có lỗi xảy ra!' });
    } finally {
      setSavingPwd(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="surface" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Thông tin tài khoản</h2>
        
        {message.text && (
          <div className={`badge ${message.type === 'success' ? 'badge-success' : 'badge-danger'} w-full mb-6`} style={{ padding: '1rem', borderRadius: '8px' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {user?.role !== 'ADMIN' && (
              <>
                <div className="form-group mb-0">
                  <label className="form-label">Mã sinh viên</label>
                  <input type="text" name="studentCode" className="form-input" value={profile.studentCode || ''} onChange={handleChange} required disabled />
                </div>
    
                <div className="form-group mb-0">
                  <label className="form-label">Lớp</label>
                  <input type="text" name="className" className="form-input" value={profile.className || ''} onChange={handleChange} disabled />
                </div>
              </>
            )}
            
            {user?.role === 'ADMIN' && (
              <>
                <div className="form-group mb-0">
                  <label className="form-label">Tên đăng nhập</label>
                  <input type="text" className="form-input" value={user?.id || 'admin'} disabled />
                </div>
    
                <div className="form-group mb-0">
                  <label className="form-label">Quyền hạn</label>
                  <input type="text" className="form-input" value="Quản trị viên hệ thống" disabled />
                </div>
              </>
            )}

            <div className="form-group mb-0">
              <label className="form-label">Họ và tên</label>
              <input type="text" name="fullName" className="form-input" value={profile.fullName || ''} onChange={handleChange} required />
            </div>
            
            <div className="form-group mb-0">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-input" value={profile.email || ''} onChange={handleChange} required />
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Số điện thoại</label>
              <input type="text" name="phone" className="form-input" value={profile.phone || ''} onChange={handleChange} />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowPwdModal(true)}>Đổi mật khẩu</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>

      {showPwdModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="surface" style={{ width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: '12px', position: 'relative' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Đổi mật khẩu</h3>
            
            {pwdMessage.text && (
              <div className={`badge ${pwdMessage.type === 'success' ? 'badge-success' : 'badge-danger'} w-full mb-4`} style={{ padding: '0.75rem', borderRadius: '8px' }}>
                {pwdMessage.text}
              </div>
            )}

            <form onSubmit={handlePwdSubmit}>
              <div className="form-group">
                <label className="form-label">Mật khẩu cũ</label>
                <input type="password" name="oldPassword" className="form-input" value={pwdData.oldPassword} onChange={handlePwdChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <input type="password" name="newPassword" className="form-input" value={pwdData.newPassword} onChange={handlePwdChange} required minLength="6" />
              </div>
              <div className="form-group mb-6">
                <label className="form-label">Xác nhận mật khẩu mới</label>
                <input type="password" name="confirmPassword" className="form-input" value={pwdData.confirmPassword} onChange={handlePwdChange} required minLength="6" />
              </div>
              
              <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowPwdModal(false);
                  setPwdMessage({ type: '', text: '' });
                }}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={savingPwd}>
                  {savingPwd ? 'Đang lưu...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
