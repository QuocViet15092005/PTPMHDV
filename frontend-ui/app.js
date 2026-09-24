let token = localStorage.getItem('jwt') || null;
let currentUser = null;

// DOM Elements
const tabs = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');

const titles = {
    'account-tab': { title: 'Tài khoản', sub: 'Đăng ký hoặc đăng nhập tài khoản để sử dụng hệ thống.' },
    'student-tab': { title: 'Sinh viên', sub: 'Quản lý hồ sơ sinh viên: thêm, sửa, xóa, tìm kiếm.' },
    'course-tab': { title: 'Môn học', sub: 'Quản lý môn học và số chỗ còn lại.' },
    'registration-tab': { title: 'Đăng ký học phần', sub: 'Đăng ký / hủy học phần cho sinh viên.' }
};

// Navigation
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const target = tab.dataset.target;
        document.getElementById(target).classList.add('active');
        
        pageTitle.textContent = titles[target].title;
        pageSubtitle.textContent = titles[target].sub;

        if(target === 'student-tab') fetchStudents();
        if(target === 'course-tab') fetchCourses();
        if(target === 'registration-tab') {
            loadDropdowns();
            fetchRegistrations();
        }
    });
});

// Toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Fetch helper
async function fetchAPI(service, endpoint, options = {}) {
    const port = document.getElementById(`port-${service}`).value;
    const url = `http://localhost:${port}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    try {
        const response = await fetch(url, { ...options, headers });
        const data = await response.json().catch(() => ({})); // Handle empty responses
        if (!response.ok || data.success === false) {
            throw new Error(data.message || 'Có lỗi xảy ra');
        }
        return data.data || data; // Return wrapped data or data itself
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

// Auth
function updateAuthStatus() {
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            document.getElementById('status-text').textContent = 'Đã đăng nhập';
            document.getElementById('status-user').textContent = payload.sub || 'User';
            document.getElementById('logout-btn').classList.remove('hidden');
        } catch (e) {
            logout();
        }
    } else {
        document.getElementById('status-text').textContent = 'Chưa đăng nhập';
        document.getElementById('status-user').textContent = '—';
        document.getElementById('logout-btn').classList.add('hidden');
    }
}

function logout() {
    token = null;
    localStorage.removeItem('jwt');
    updateAuthStatus();
    showToast('Đã đăng xuất');
}

document.getElementById('logout-btn').addEventListener('click', logout);

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    try {
        const data = await fetchAPI('auth', '/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        token = data.token || data; // Depending on actual response structure
        localStorage.setItem('jwt', token);
        updateAuthStatus();
        showToast('Đăng nhập thành công');
    } catch (e) {}
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        username: document.getElementById('reg-username').value,
        password: document.getElementById('reg-password').value,
        role: document.getElementById('reg-role').value,
        studentId: document.getElementById('reg-student-id').value || null
    };
    try {
        await fetchAPI('auth', '/auth/register', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        showToast('Đăng ký tài khoản thành công');
    } catch (e) {}
});

// Student
window.fetchStudents = async function() {
    try {
        const search = document.getElementById('stu-search').value;
        const students = await fetchAPI('student', '/students');
        const tbody = document.querySelector('#student-table tbody');
        if (!students || students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Chưa có sinh viên nào.</td></tr>';
            return;
        }
        
        tbody.innerHTML = students
            .filter(s => !search || s.studentCode.includes(search) || s.fullName.includes(search))
            .map(s => `
            <tr>
                <td>${s.studentCode}</td>
                <td>${s.fullName}</td>
                <td>${s.className}</td>
                <td>${s.email}</td>
                <td>${s.phoneNumber}</td>
                <td>Đang học</td>
            </tr>
        `).join('');
    } catch (e) {}
}

document.getElementById('student-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        studentCode: document.getElementById('stu-code').value,
        fullName: document.getElementById('stu-name').value,
        dateOfBirth: document.getElementById('stu-dob').value,
        gender: document.getElementById('stu-gender').value,
        email: document.getElementById('stu-email').value,
        phoneNumber: document.getElementById('stu-phone').value,
        className: document.getElementById('stu-class').value
    };
    try {
        await fetchAPI('student', '/students', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        showToast('Thêm sinh viên thành công');
        fetchStudents();
        document.getElementById('student-form').reset();
    } catch (e) {}
});

document.getElementById('stu-reset').addEventListener('click', () => {
    document.getElementById('student-form').reset();
});

// Course
window.fetchCourses = async function() {
    try {
        const search = document.getElementById('crs-search').value;
        const courses = await fetchAPI('course', '/courses');
        const tbody = document.querySelector('#course-table tbody');
        if (!courses || courses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Chưa có môn học nào.</td></tr>';
            return;
        }
        
        tbody.innerHTML = courses
            .filter(c => !search || c.courseCode.includes(search) || c.courseName.includes(search))
            .map(c => `
            <tr>
                <td>${c.courseCode}</td>
                <td>${c.courseName}</td>
                <td>${c.credits}</td>
                <td>${c.remainingSeats} / ${c.maxStudents}</td>
            </tr>
        `).join('');
    } catch (e) {}
}

document.getElementById('course-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        courseCode: document.getElementById('crs-code').value,
        courseName: document.getElementById('crs-name').value,
        credits: parseInt(document.getElementById('crs-credits').value),
        maxStudents: parseInt(document.getElementById('crs-max-students').value)
    };
    try {
        await fetchAPI('course', '/courses', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        showToast('Thêm môn học thành công');
        fetchCourses();
        document.getElementById('course-form').reset();
    } catch (e) {}
});

document.getElementById('crs-reset').addEventListener('click', () => {
    document.getElementById('course-form').reset();
});

// Registration
window.loadDropdowns = async function() {
    try {
        const students = await fetchAPI('student', '/students');
        const stuSelect = document.getElementById('reg-student-select');
        stuSelect.innerHTML = '<option value="">-- Chọn sinh viên --</option>' + 
            students.map(s => `<option value="${s.id}">${s.fullName} (${s.studentCode})</option>`).join('');
            
        const courses = await fetchAPI('course', '/courses');
        const crsSelect = document.getElementById('reg-course-select');
        crsSelect.innerHTML = '<option value="">-- Chọn môn học --</option>' + 
            courses.map(c => `<option value="${c.id}">${c.courseName} (${c.courseCode})</option>`).join('');
    } catch (e) {}
}

window.fetchRegistrations = async function() {
    try {
        const filterId = document.getElementById('reg-filter-student').value;
        let endpoint = '/registrations';
        if (filterId) {
            endpoint = `/registrations/student/${filterId}`;
        }
        const regs = await fetchAPI('registration', endpoint);
        const tbody = document.querySelector('#registration-table tbody');
        
        // Handle array or wrapped response
        const regsArray = Array.isArray(regs) ? regs : (regs.content || []);
        
        if (!regsArray || regsArray.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Chưa có bản ghi đăng ký nào.</td></tr>';
            return;
        }
        
        tbody.innerHTML = regsArray.map(reg => {
            const courseStr = reg.course ? `${reg.course.courseName} (${reg.course.courseCode})` : `Môn ID: ${reg.courseId}`;
            const studentStr = `SV ID: ${reg.studentId}`;
            const statusStr = reg.status === 'CANCELLED' ? '<span style="color:var(--warning)">Đã hủy</span>' : '<span style="color:var(--success)">Thành công</span>';
            const dateStr = reg.registeredAt ? new Date(reg.registeredAt).toLocaleString('vi-VN') : (reg.registrationDate ? new Date(reg.registrationDate).toLocaleString('vi-VN') : '');
            
            return `
            <tr>
                <td>${reg.id}</td>
                <td>${studentStr}</td>
                <td>${courseStr}</td>
                <td>${dateStr}</td>
                <td>${statusStr}</td>
            </tr>
        `}).join('');
    } catch (e) {}
}

document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        studentId: parseInt(document.getElementById('reg-student-select').value),
        courseId: parseInt(document.getElementById('reg-course-select').value)
    };
    try {
        await fetchAPI('registration', '/registrations', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        showToast('Đăng ký môn thành công');
        fetchRegistrations();
    } catch (e) {}
});

// Init
updateAuthStatus();
