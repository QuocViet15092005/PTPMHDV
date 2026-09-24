---
marp: true
theme: default
paginate: true
---

# BÁO CÁO BÀI TẬP LỚN: PHÁT TRIỂN PHẦN MỀM HƯỚNG DỊCH VỤ (PTPMHDV)

**Đề tài:** Xây dựng Hệ thống Đăng ký học phần theo Kiến trúc Microservices
**Nhóm sinh viên thực hiện:** [Tên sinh viên 1], [Tên sinh viên 2]
**Giảng viên hướng dẫn:** [Tên giảng viên]

---

## 1. Mục tiêu đề tài

- Hiểu và áp dụng kiến trúc **Microservices** vào bài toán thực tế (Đăng ký học phần).
- Thay thế hệ thống Monolithic truyền thống bằng các dịch vụ nhỏ gọn, độc lập.
- Sử dụng **Spring Boot** và **Spring Cloud** (Eureka, Gateway, OpenFeign).
- Đảm bảo tính nhất quán dữ liệu (Transaction) trong môi trường phân tán.

---

## 2. Các công nghệ sử dụng

- **Backend:** Java 17, Spring Boot 3, Spring Cloud, Spring Data JPA
- **Database:** MySQL (4 database độc lập cho 4 service)
- **Giao tiếp:** RESTful API (RestTemplate / OpenFeign)
- **Bảo mật:** JWT (JSON Web Token), Spring Cloud Gateway Filter
- **Tài liệu API:** Swagger UI / OpenAPI 3.0

---

## 3. Sơ đồ Kiến trúc Hệ thống

![Sơ đồ kiến trúc](https://i.imgur.com/your-mermaid-diagram.png) *(Hoặc copy sơ đồ từ README vào đây)*

Hệ thống bao gồm 6 thành phần chính:
1. **Eureka Server:** Service Registry
2. **API Gateway:** Cổng vào duy nhất, xác thực JWT, định tuyến
3. **Auth Service:** Cấp phát token, quản lý tài khoản
4. **Student Service:** Quản lý sinh viên
5. **Course Service:** Quản lý môn học, số chỗ
6. **Registration Service:** Xử lý logic đăng ký, gọi chéo các service

---

## 4. Giải pháp Thiết kế Cơ sở dữ liệu

- Áp dụng nguyên tắc **Database per service**:
  - `auth_db`: Bảng `users`
  - `student_db`: Bảng `students`
  - `course_db`: Bảng `courses`
  - `registration_db`: Bảng `registrations`
- Các service không query trực tiếp vào DB của nhau mà gọi qua API.

---

## 5. Giải quyết bài toán Đăng ký học phần (Logic & Transaction)

- **Bước 1:** `registration-service` nhận request, gọi `student-service` kiểm tra sinh viên hợp lệ.
- **Bước 2:** Gọi `course-service` kiểm tra môn học còn chỗ.
- **Bước 3:** **Lưu bản ghi đăng ký vào DB trước** (Bảo vệ dữ liệu).
- **Bước 4:** Gọi `course-service` để trừ đi 1 chỗ (`reserve-seat`).
- **Xử lý lỗi:** Nếu bước 4 (gọi API) thất bại (VD: đứt mạng, hết chỗ đột xuất), `@Transactional` của Spring sẽ **tự động rollback** bản ghi vừa lưu ở Bước 3.

---

## 6. Kịch bản Demo Báo Cáo

1. Giới thiệu Eureka Dashboard và Swagger UI.
2. Đăng nhập qua API Gateway lấy Token.
3. Test JWT: Gọi API không có Token (bị chặn 401).
4. Thử đăng ký môn học thành công.
5. Thử đăng ký môn học đã hết chỗ (thấy lỗi 400).
6. **Demo tính chịu lỗi:** Tắt `course-service`, thử đăng ký, hệ thống báo lỗi an toàn và không bị sinh rác trong database.

---

## 7. Khó khăn và Hướng phát triển

**Khó khăn đã gặp:**
- Cấu hình Gateway kết hợp với JWT Filter trong WebFlux.
- Xử lý phân tán Transaction (Distributed Transaction) - hiện giải quyết bằng rollback thủ công / @Transactional cục bộ kết hợp API theo thứ tự.

**Hướng phát triển:**
- Triển khai **Saga Pattern** bằng Kafka / RabbitMQ thay vì gọi REST đồng bộ để tăng hiệu năng lúc cao điểm (như lúc mở đăng ký tín chỉ).
- Đưa hệ thống lên Docker / Kubernetes.

---

# CẢM ƠN THẦY VÀ CÁC BẠN ĐÃ LẮNG NGHE!
*(Q&A)*
