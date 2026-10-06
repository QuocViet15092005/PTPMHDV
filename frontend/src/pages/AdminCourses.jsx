import { useEffect, useState } from 'react';
import api from '../services/api';

const emptyForm = {
  courseCode: '',
  courseName: '',
  credits: 3,
  department: '',
  lecturer: '',
  semester: 'HK1-2025',
  maxStudents: 50,
  dayOfWeek: '',
  startTime: '',
  endTime: '',
  room: '',
  description: '',
};

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses', { params: { search, limit: 100 } });
      setCourses(data.data);
    } catch {
      alert('Không tải được danh sách môn');
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line
  }, [search]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setForm({ ...emptyForm, ...c });
    setEditingId(c.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, form);
        alert('✅ Cập nhật thành công');
      } else {
        await api.post('/courses', form);
        alert('✅ Thêm môn thành công');
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Lỗi lưu dữ liệu'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa môn này?')) return;
    try {
      await api.delete(`/courses/${id}`);
      fetchCourses();
    } catch {
      alert('Lỗi xóa môn');
    }
  };

  const upd = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">📚 Quản lý Môn học</h1>
            <p className="text-indigo-100 mt-1">Thêm, sửa, xóa môn học</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-white text-indigo-600 font-semibold px-5 py-3 rounded-lg shadow hover:shadow-lg hover:bg-indigo-50 transition flex items-center gap-2"
          >
            <span className="text-xl">＋</span> Thêm môn học
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <input
          placeholder="🔍 Tìm theo mã hoặc tên môn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left font-semibold">Mã môn</th>
                  <th className="p-3 text-left font-semibold">Tên môn</th>
                  <th className="p-3 text-center font-semibold">TC</th>
                  <th className="p-3 text-left font-semibold">Khoa</th>
                  <th className="p-3 text-center font-semibold">Học kỳ</th>
                  <th className="p-3 text-center font-semibold">Sĩ số</th>
                  <th className="p-3 text-center font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3 font-mono font-semibold text-blue-700">
                      {c.courseCode}
                    </td>
                    <td className="p-3">{c.courseName}</td>
                    <td className="p-3 text-center">{c.credits}</td>
                    <td className="p-3">{c.department}</td>
                    <td className="p-3 text-center">{c.semester}</td>
                    <td className="p-3 text-center">
                      <span
                        className={
                          c.isFull
                            ? 'text-red-600 font-semibold'
                            : 'text-green-600 font-semibold'
                        }
                      >
                        {c.currentStudents}/{c.maxStudents}
                      </span>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-blue-600 hover:underline mr-3 font-medium"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-red-600 hover:underline font-medium"
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      Chưa có môn học nào. Nhấn "Thêm môn học" để bắt đầu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5">
              <h2 className="text-xl font-bold">
                {editingId ? '✏️ Sửa môn học' : '➕ Thêm môn học mới'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã môn *
                  </label>
                  <input
                    required
                    value={form.courseCode}
                    onChange={(e) => upd('courseCode', e.target.value.toUpperCase())}
                    className="w-full p-2 border border-gray-300 rounded-lg font-mono"
                    placeholder="IT001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số tín chỉ *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={form.credits}
                    onChange={(e) => upd('credits', +e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên môn *
                </label>
                <input
                  required
                  value={form.courseName}
                  onChange={(e) => upd('courseName', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Nhập môn Lập trình"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khoa *
                  </label>
                  <input
                    required
                    value={form.department}
                    onChange={(e) => upd('department', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="CNTT"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giảng viên
                  </label>
                  <input
                    value={form.lecturer}
                    onChange={(e) => upd('lecturer', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="TS. Nguyễn Văn A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Học kỳ *
                  </label>
                  <input
                    required
                    value={form.semester}
                    onChange={(e) => upd('semester', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="HK1-2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số chỗ tối đa *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.maxStudents}
                    onChange={(e) => upd('maxStudents', +e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <input
                  placeholder="Thứ"
                  value={form.dayOfWeek}
                  onChange={(e) => upd('dayOfWeek', e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  placeholder="07:30"
                  value={form.startTime}
                  onChange={(e) => upd('startTime', e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  placeholder="09:30"
                  value={form.endTime}
                  onChange={(e) => upd('endTime', e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  placeholder="A101"
                  value={form.room}
                  onChange={(e) => upd('room', e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <textarea
                rows={2}
                placeholder="Mô tả môn học..."
                value={form.description}
                onChange={(e) => upd('description', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="p-4 bg-gray-50 flex justify-end gap-2 rounded-b-xl">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-white transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
              >
                {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}