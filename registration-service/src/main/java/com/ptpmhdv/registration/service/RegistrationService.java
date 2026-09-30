package com.ptpmhdv.registration.service;

import com.ptpmhdv.registration.client.CourseClient;
import com.ptpmhdv.registration.client.StudentClient;
import com.ptpmhdv.registration.dto.RegistrationRequest;
import com.ptpmhdv.registration.dto.RegistrationResponse;
import com.ptpmhdv.registration.dto.external.CourseDTO;
import com.ptpmhdv.registration.dto.external.StudentDTO;
import com.ptpmhdv.registration.entity.Registration;
import com.ptpmhdv.registration.entity.RegistrationStatus;
import com.ptpmhdv.registration.exception.BadRequestException;
import com.ptpmhdv.registration.exception.ResourceNotFoundException;
import com.ptpmhdv.registration.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final StudentClient studentClient;
    private final CourseClient courseClient;

    @Transactional
    public RegistrationResponse registerCourse(RegistrationRequest request) {
        log.info("Bắt đầu xử lý đăng ký học phần: Student ID={}, Course ID={}", request.getStudentId(), request.getCourseId());

        // 1. Gọi Student Service để xác nhận sinh viên tồn tại
        StudentDTO student = studentClient.getStudentById(request.getStudentId());
        log.info("Xác thực sinh viên thành công: {} ({})", student.getFullName(), student.getStudentCode());

        // 2. Gọi Course Service để xác nhận môn học tồn tại
        CourseDTO course = courseClient.getCourseById(request.getCourseId());
        log.info("Xác thực môn học thành công: {} (Còn {} chỗ)", course.getCourseName(), course.getRemainingSeats());

        // 3. Kiểm tra môn học còn chỗ hay không
        if (course.getRemainingSeats() <= 0) {
            throw new BadRequestException("Môn học '" + course.getCourseName() + "' (Mã: " + course.getCourseCode() + ") đã hết chỗ trống!");
        }

        // 4. Kiểm tra sinh viên đã đăng ký môn này chưa
        boolean alreadyRegistered = registrationRepository.existsByStudentIdAndCourseIdAndStatus(
                request.getStudentId(),
                request.getCourseId(),
                RegistrationStatus.ACTIVE
        );

        if (alreadyRegistered) {
            throw new BadRequestException("Sinh viên " + student.getFullName() + " đã đăng ký môn '" + course.getCourseName() + "' rồi!");
        }

        List<RegistrationResponse> activeRegistrations = getRegistrationsByStudentId(request.getStudentId());

        int totalCredits = course.getCredits() != null ? course.getCredits() : 0;
        for (RegistrationResponse reg : activeRegistrations) {
            if (reg.getCourse() != null && reg.getCourse().getCredits() != null) {
                totalCredits += reg.getCourse().getCredits();
            }
        }

        if (totalCredits > 24) {
            throw new BadRequestException("Vượt quá số tín chỉ tối đa (24 tín chỉ). Tổng số tín chỉ nếu đăng ký sẽ là: " + totalCredits);
        }

        if (course.getDayOfWeek() != null && course.getStartPeriod() != null && course.getEndPeriod() != null) {
            for (RegistrationResponse reg : activeRegistrations) {
                CourseDTO registeredCourse = reg.getCourse();
                if (registeredCourse != null && registeredCourse.getDayOfWeek() != null &&
                        registeredCourse.getStartPeriod() != null && registeredCourse.getEndPeriod() != null) {

                    if (course.getDayOfWeek().equals(registeredCourse.getDayOfWeek())) {
                        if (!(course.getEndPeriod() < registeredCourse.getStartPeriod() ||
                                course.getStartPeriod() > registeredCourse.getEndPeriod())) {
                            throw new BadRequestException("Trùng lịch học với môn: " + registeredCourse.getCourseName());
                        }
                    }
                }
            }
        }

        // 5. Lưu thông tin đăng ký vào database trước
        Registration registration = Registration.builder()
                .studentId(request.getStudentId())
                .courseId(request.getCourseId())
                .status(RegistrationStatus.ACTIVE)
                .build();

        Registration saved = registrationRepository.save(registration);
        log.info("Lưu bản ghi đăng ký thành công với ID={}", saved.getId());

        // 6. Gọi Course Service để giảm 1 chỗ trống (reserve-seat)
        CourseDTO updatedCourse;
        try {
            updatedCourse = courseClient.reserveSeat(request.getCourseId());
            log.info("Giữ chỗ thành công. Số chỗ còn lại của môn: {}", updatedCourse.getRemainingSeats());
        } catch (Exception e) {
            log.error("Lỗi khi giữ chỗ, transaction sẽ bị rollback: {}", e.getMessage());
            throw new BadRequestException("Không thể đăng ký môn học (có thể môn học đã hết chỗ hoặc dịch vụ lỗi).");
        }

        return RegistrationResponse.builder()
                .id(saved.getId())
                .studentId(saved.getStudentId())
                .courseId(saved.getCourseId())
                .registeredAt(saved.getRegisteredAt())
                .status(saved.getStatus())
                .letterGrade(saved.getLetterGrade())
                .student(student)
                .course(updatedCourse)
                .build();
    }

    @Transactional
    public RegistrationResponse cancelRegistration(Long id) {
        log.info("Bắt đầu xử lý hủy đăng ký học phần ID={}", id);

        // 1. Kiểm tra bản ghi đăng ký
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bản ghi đăng ký với ID: " + id));

        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new BadRequestException("Học phần này đã được hủy trước đó!");
        }

        // 2. Chuyển trạng thái đăng ký sang CANCELLED
        registration.setStatus(RegistrationStatus.CANCELLED);
        Registration saved = registrationRepository.save(registration);

        // 3. Gọi Course Service để tăng lại số chỗ (release-seat)
        CourseDTO updatedCourse = courseClient.releaseSeat(registration.getCourseId());
        log.info("Hoàn trả 1 chỗ cho môn ID={}. Số chỗ hiện tại: {}", registration.getCourseId(), updatedCourse.getRemainingSeats());

        // 4. Lấy thông tin sinh viên để làm giàu dữ liệu trả về
        StudentDTO student = null;
        try {
            student = studentClient.getStudentById(registration.getStudentId());
        } catch (Exception e) {
            log.warn("Không thể lấy chi tiết sinh viên khi hủy môn: {}", e.getMessage());
        }

        return RegistrationResponse.builder()
                .id(saved.getId())
                .studentId(saved.getStudentId())
                .courseId(saved.getCourseId())
                .registeredAt(saved.getRegisteredAt())
                .status(saved.getStatus())
                .letterGrade(saved.getLetterGrade())
                .student(student)
                .course(updatedCourse)
                .build();
    }

    public List<RegistrationResponse> getAllRegistrations() {
        return registrationRepository.findAll().stream()
                .map(this::enrichRegistration)
                .collect(Collectors.toList());
    }

    public RegistrationResponse getRegistrationById(Long id) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bản ghi đăng ký với ID: " + id));
        return enrichRegistration(registration);
    }

    public List<RegistrationResponse> getRegistrationsByStudentId(Long studentId) {
        return registrationRepository.findByStudentIdAndStatus(studentId, RegistrationStatus.ACTIVE).stream()
                .map(this::enrichRegistration)
                .collect(Collectors.toList());
    }

    private RegistrationResponse enrichRegistration(Registration registration) {
        StudentDTO student = null;
        CourseDTO course = null;

        try {
            student = studentClient.getStudentById(registration.getStudentId());
        } catch (Exception e) {
            log.warn("Không thể tải thông tin sinh viên ID={}: {}", registration.getStudentId(), e.getMessage());
        }

        try {
            course = courseClient.getCourseById(registration.getCourseId());
        } catch (Exception e) {
            log.warn("Không thể tải thông tin môn học ID={}: {}", registration.getCourseId(), e.getMessage());
        }

        return RegistrationResponse.builder()
                .id(registration.getId())
                .studentId(registration.getStudentId())
                .courseId(registration.getCourseId())
                .registeredAt(registration.getRegisteredAt())
                .status(registration.getStatus())
                .letterGrade(registration.getLetterGrade())
                .student(student)
                .course(course)
                .build();
    }
}
