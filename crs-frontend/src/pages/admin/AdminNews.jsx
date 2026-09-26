import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Edit2, Trash2, X, Pin, Calendar } from 'lucide-react';

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tin nhà trường',
    content: '',
    pinned: false
  });

  const [editId, setEditId] = useState(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/news');
      setNews(res.data);
    } catch (err) {
      console.error('Lỗi khi tải tin tức', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setFormData({
      title: '',
      category: 'Tin nhà trường',
      content: '',
      pinned: false
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditId(item.id);
    setFormData({
      title: item.title,
      category: item.category,
      content: item.content,
      pinned: item.pinned
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/news/${editId}`, formData);
      } else {
        await api.post('/news', formData);
      }
      setShowModal(false);
      fetchNews();
    } catch (err) {
      alert(editId ? 'Cập nhật thất bại!' : 'Thêm tin tức thất bại!');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin này không?')) {
      try {
        await api.delete(`/news/${id}`);
        fetchNews();
      } catch (err) {
        alert('Xóa thất bại!');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Quản lý Tin tức & Sự kiện</h1>
          <p className="text-muted mt-1">Trang dành cho quản trị viên thêm, sửa, xóa tin tức</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Đăng tin mới
        </button>
      </div>

      <div className="surface table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Chuyên mục</th>
              <th>Tiêu đề</th>
              <th>Ngày đăng</th>
              <th className="text-center">Ghim</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8">Đang tải...</td></tr>
            ) : news.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8">Chưa có tin tức nào</td></tr>
            ) : (
              news.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: '500' }}>#{item.id}</td>
                  <td>
                    <span className={`badge ${item.category === 'Tin đào tạo' ? 'badge-primary' : item.category === 'Sự kiện' ? 'badge-success' : 'badge-warning'}`}>
                      {item.category}
                    </span>
                  </td>
                  <td>{item.title}</td>
                  <td>
                    <div className="flex items-center gap-1 text-muted">
                      <Calendar size={14} /> {item.publishedDate}
                    </div>
                  </td>
                  <td className="text-center">
                    {item.pinned && <Pin size={16} className="text-primary mx-auto" style={{ transform: 'rotate(45deg)' }} />}
                  </td>
                  <td className="text-center flex justify-center gap-2">
                    <button className="btn btn-secondary" style={{ padding: '0.4rem', color: '#10b981' }} onClick={() => openEditModal(item)} title="Chỉnh sửa">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem', color: '#ef4444' }} onClick={() => handleDelete(item.id)} title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="surface" style={{ width: '100%', maxWidth: '700px', padding: '2rem', borderRadius: '12px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{editId ? 'Chỉnh sửa Tin tức' : 'Đăng Tin mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tiêu đề</label>
                <input type="text" className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Chuyên mục</label>
                <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                  <option value="Tin nhà trường">Tin nhà trường</option>
                  <option value="Tin đào tạo">Tin đào tạo</option>
                  <option value="Sự kiện">Sự kiện</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nội dung</label>
                <textarea className="form-input" rows="5" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required></textarea>
              </div>
              <div className="form-group flex" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="pinned" checked={formData.pinned} onChange={e => setFormData({...formData, pinned: e.target.checked})} style={{ width: '1.2rem', height: '1.2rem' }} />
                <label htmlFor="pinned" className="form-label" style={{ marginBottom: 0 }}>Ghim lên đầu</label>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Cập nhật' : 'Đăng tin'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNews;
