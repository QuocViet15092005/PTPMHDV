import React, { useEffect, useState } from 'react';
import { Newspaper, Pin, Calendar, ChevronRight } from 'lucide-react';
import api from '../api/axios';

const News = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get('/news');
        setNewsList(res.data);
      } catch (error) {
        console.error('Failed to fetch news', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444' }}>
          <Newspaper size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Tin tức & Thông báo</h1>
          <p className="text-muted mt-1">Cập nhật những thông tin mới nhất từ nhà trường</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsList.map((news) => (
          <div key={news.id} className="surface flex flex-col" style={{ padding: '1.5rem', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
            <div className="flex justify-between items-start mb-4">
              <span className={`badge ${news.category === 'Tin đào tạo' ? 'badge-primary' : news.category === 'Sự kiện' ? 'badge-success' : 'badge-warning'}`}>
                {news.category}
              </span>
              {news.pinned && <Pin size={16} className="text-primary" style={{ transform: 'rotate(45deg)' }} />}
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.4' }}>
              {news.title}
            </h3>
            <p className="text-muted mb-6 flex-1" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
              {news.content}
            </p>
            <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div className="flex items-center gap-1 text-muted" style={{ fontSize: '0.8rem' }}>
                <Calendar size={14} /> {news.publishedDate}
              </div>
              <div className="text-primary flex items-center gap-1" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                Xem chi tiết <ChevronRight size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;
