package com.university.course_service.service;

import com.university.course_service.dto.*;
import com.university.course_service.entity.Course;
import com.university.course_service.exception.BadRequestException;
import com.university.course_service.exception.NotFoundException;
import com.university.course_service.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository repo;

    public PageResponse<CourseResponse> search(String keyword, String semester,
                                               String department, int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("courseCode").ascending());
        Page<CourseResponse> result = repo.search(
                keyword == null || keyword.isBlank() ? null : keyword.trim(),
                semester == null || semester.isBlank() ? null : semester.trim(),
                department == null || department.isBlank() ? null : department.trim(),
                pageable
        ).map(CourseResponse::from);
        return PageResponse.from(result);
    }

    public CourseResponse findById(Long id) {
        return repo.findByIdAndIsActiveTrue(id)
                .map(CourseResponse::from)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy môn học"));
    }

    @Transactional
    public CourseResponse create(CourseRequest req) {
        if (repo.existsByCourseCode(req.getCourseCode().toUpperCase()))
            throw new BadRequestException("Mã môn học đã tồn tại");

        Course c = Course.builder()
                .courseCode(req.getCourseCode().toUpperCase())
                .courseName(req.getCourseName())
                .credits(req.getCredits())
                .department(req.getDepartment())
                .lecturer(req.getLecturer())
                .semester(req.getSemester())
                .maxStudents(req.getMaxStudents())
                .currentStudents(0)
                .dayOfWeek(req.getDayOfWeek())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .room(req.getRoom())
                .description(req.getDescription())
                .isActive(true)
                .build();
        return CourseResponse.from(repo.save(c));
    }

    @Transactional
    public CourseResponse update(Long id, CourseRequest req) {
        Course c = repo.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy môn học"));

        if (!c.getCourseCode().equalsIgnoreCase(req.getCourseCode())
                && repo.existsByCourseCode(req.getCourseCode().toUpperCase()))
            throw new BadRequestException("Mã môn học đã tồn tại");

        c.setCourseCode(req.getCourseCode().toUpperCase());
        c.setCourseName(req.getCourseName());
        c.setCredits(req.getCredits());
        c.setDepartment(req.getDepartment());
        c.setLecturer(req.getLecturer());
        c.setSemester(req.getSemester());
        c.setMaxStudents(req.getMaxStudents());
        c.setDayOfWeek(req.getDayOfWeek());
        c.setStartTime(req.getStartTime());
        c.setEndTime(req.getEndTime());
        c.setRoom(req.getRoom());
        c.setDescription(req.getDescription());
        return CourseResponse.from(repo.save(c));
    }

    @Transactional
    public void softDelete(Long id) {
        Course c = repo.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy môn học"));
        c.setIsActive(false);
        repo.save(c);
    }

    @Transactional
    public CourseResponse enroll(Long id) {
        int updated = repo.incrementEnrollment(id);
        if (updated == 0)
            throw new BadRequestException("Môn đã hết chỗ hoặc không tồn tại");
        return findById(id);
    }
}