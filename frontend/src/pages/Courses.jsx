import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/courses', {
          params: { search, department, semester, limit: 100 },
        });
        setCourses(data.data);
      } catch {
        alert('Lỗi tải danh sách môn học');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, department, semester]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 shadow-lg">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold">🎓 Tra cứu Môn học</h1>
          <p className="text-blue-100 mt-1">Xem danh sách môn học toàn trường</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            placeholder="🔍 Mã hoặc tên môn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            placeholder="🏛️ Khoa (VD: CNTT)"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            placeholder="📅 Học kỳ (VD: HK1-2025)"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="mb-4 text-sm text-gray-600">
          {loading ? (
            <span>⏳ Đang tải...</span>
          ) : (
            <span>
              Tìm thấy <b className="text-blue-600">{courses.length}</b> môn học
            </span>
          )}
        </div>

        {!loading && courses.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-5xl mb-3">📭</p>
            <p>Không có môn học nào phù hợp.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelected(c)}
              className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-100 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                    {c.courseCode}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded font-semibold ${
                      c.isFull
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {c.isFull ? '🔴 Hết chỗ' : '✅ Còn chỗ'}
                  </span>
                </div>

                <h3 className="font-bold text-lg leading-snug mb-1 text-gray-800">
                  {c.courseName}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {c.department} · {c.credits} tín chỉ
                </p>

                <div className="text-sm space-y-1 text-gray-700 border-t pt-3">
                  <p>👨‍🏫 {c.lecturer || 'Chưa phân công'}</p>
                  <p>
                    👥{' '}
                    <span className={c.isFull ? 'text-red-600 font-semibold' : ''}>
                      {c.currentStudents}/{c.maxStudents}
                    </span>{' '}
                    sinh viên
                  </p>
                  {c.dayOfWeek && (
                    <p>
                      🕒 {c.dayOfWeek} {c.startTime}–{c.endTime}
                      {c.room && ` · ${c.room}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <span className="font-mono text-sm bg-white/20 px-2 py-1 rounded">
                {selected.courseCode}
              </span>
              <h2 className="text-2xl font-bold mt-2">{selected.courseName}</h2>
            </div>

            <div className="p-6 space-y-3">
              <p className="text-gray-600 italic">
                {selected.description || 'Không có mô tả.'}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t">
                <div>
                  <p className="text-gray-500">Khoa</p>
                  <p className="font-semibold">{selected.department}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tín chỉ</p>
                  <p className="font-semibold">{selected.credits}</p>
                </div>
                <div>
                  <p className="text-gray-500">Giảng viên</p>
                  <p className="font-semibold">{selected.lecturer || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Học kỳ</p>
                  <p className="font-semibold">{selected.semester}</p>
                </div>
                <div>
                  <p className="text-gray-500">Sĩ số</p>
                  <p className="font-semibold">
                    {selected.currentStudents}/{selected.maxStudents}
                  </p>
                </div>
                {selected.dayOfWeek && (
                  <div>
                    <p className="text-gray-500">Lịch học</p>
                    <p className="font-semibold">
                      {selected.dayOfWeek} {selected.startTime}–{selected.endTime}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 flex gap-2">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-2 border rounded-lg hover:bg-white transition"
              >
                Đóng
              </button>
              <button
                disabled={selected.isFull}
                className={`flex-1 py-2 rounded-lg text-white font-semibold transition ${
                  selected.isFull
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {selected.isFull ? 'Hết chỗ' : 'Đăng ký'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}