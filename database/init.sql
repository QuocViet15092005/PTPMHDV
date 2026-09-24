-- =========================================================================
-- HỆ THỐNG ĐĂNG KÝ HỌC PHẦN (MICROSERVICES)
-- DATABASE INITIALIZATION SCRIPT (MySQL)
-- =========================================================================

-- 1. AUTH SERVICE DATABASE (auth_db)
CREATE DATABASE IF NOT EXISTS `auth_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `auth_db`;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    `student_id` BIGINT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Users (password: 123456 - raw or bcrypt hashed)
-- Note: AuthService handles raw and bcrypt matching cleanly.
INSERT INTO `users` (`username`, `password`, `role`, `student_id`, `created_at`) VALUES
('admin', '123456', 'ADMIN', NULL, NOW()),
('sinhvien1', '123456', 'STUDENT', 1, NOW()),
('sinhvien2', '123456', 'STUDENT', 2, NOW()),
('sinhvien3', '123456', 'STUDENT', 3, NOW());


-- 2. STUDENT SERVICE DATABASE (student_db)
CREATE DATABASE IF NOT EXISTS `student_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `student_db`;

DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `student_code` VARCHAR(20) NOT NULL UNIQUE,
    `full_name` VARCHAR(100) NOT NULL,
    `date_of_birth` DATE NULL,
    `gender` VARCHAR(10) NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `class_name` VARCHAR(50) NULL,
    `status` VARCHAR(20) DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Students
INSERT INTO `students` (`student_code`, `full_name`, `date_of_birth`, `gender`, `email`, `phone`, `class_name`, `status`) VALUES
('B21DCCN001', 'Nguyễn Văn An', '2003-05-15', 'NAM', 'an.nguyen@ptit.edu.vn', '0912345678', 'D21CQCN01-N', 'ACTIVE'),
('B21DCCN002', 'Trần Thị Bình', '2003-08-20', 'NU', 'binh.tran@ptit.edu.vn', '0987654321', 'D21CQCN01-N', 'ACTIVE'),
('B21DCCN003', 'Lê Hoàng Cường', '2003-11-10', 'NAM', 'cuong.le@ptit.edu.vn', '0901234567', 'D21CQCN02-N', 'ACTIVE'),
('B21DCCN004', 'Phạm Minh Đức', '2003-02-28', 'NAM', 'duc.pham@ptit.edu.vn', '0934567890', 'D21CQCN02-N', 'ACTIVE');


-- 3. COURSE SERVICE DATABASE (course_db)
CREATE DATABASE IF NOT EXISTS `course_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `course_db`;

DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `course_code` VARCHAR(20) NOT NULL UNIQUE,
    `course_name` VARCHAR(150) NOT NULL,
    `credits` INT NOT NULL,
    `max_students` INT NOT NULL,
    `remaining_seats` INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Courses (Môn học và số chỗ ban đầu)
-- Course 3 có 2 chỗ tối đa để phục vụ kịch bản demo hết chỗ
INSERT INTO `courses` (`course_code`, `course_name`, `credits`, `max_students`, `remaining_seats`) VALUES
('INT1332', 'Phát triển phần mềm hướng dịch vụ', 3, 40, 40),
('INT1340', 'Kiến trúc máy tính', 3, 50, 50),
('INT1408', 'Chuyên đề Công nghệ phần mềm', 2, 2, 2),
('INT1306', 'Cấu trúc dữ liệu và giải thuật', 4, 60, 60);


-- 4. REGISTRATION SERVICE DATABASE (registration_db)
CREATE DATABASE IF NOT EXISTS `registration_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `registration_db`;

DROP TABLE IF EXISTS `registrations`;
CREATE TABLE `registrations` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `student_id` BIGINT NOT NULL,
    `course_id` BIGINT NOT NULL,
    `registered_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `status` VARCHAR(20) DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index to optimize querying student registrations
CREATE INDEX `idx_student_id` ON `registrations` (`student_id`);
CREATE INDEX `idx_course_id` ON `registrations` (`course_id`);
