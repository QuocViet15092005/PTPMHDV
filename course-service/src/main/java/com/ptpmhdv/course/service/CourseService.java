package com.ptpmhdv.course.service;

import com.ptpmhdv.course.dto.CourseRequest;
import com.ptpmhdv.course.dto.CourseResponse;
import com.ptpmhdv.course.entity.Course;
import com.ptpmhdv.course.exception.BadRequestException;
import com.ptpmhdv.course.exception.ResourceNotFoundException;
import com.ptpmhdv.course.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    public List<CourseResponse> getAllCourses(String keyword) {
        List<Course> courses;
        if (keyword != null && !keyword.trim().isEmpty()) {
            courses = courseRepository.searchCourses(keyword.trim());
        } else {
            courses = courseRepository.findAll();
        }
        return courses.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học với ID: " + id));
        return mapToResponse(course);
    }

    public CourseResponse getCourseByCode(String courseCode) {
        Course course = courseRepository.findByCourseCode(courseCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học với mã: " + courseCode));
        return mapToResponse(course);
    }

    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        if (courseRepository.existsByCourseCode(request.getCourseCode())) {
            throw new BadRequestException("Mã môn học '" + request.getCourseCode() + "' đã tồn tại!");
        }

        Integer remaining = (request.getRemainingSeats() != null) ? request.getRemainingSeats() : request.getMaxStudents();
        if (remaining > request.getMaxStudents()) {
            throw new BadRequestException("Số chỗ còn lại không thể lớn hơn số chỗ tối đa!");
        }

        Course course = Course.builder()
                .courseCode(request.getCourseCode())
                .courseName(request.getCourseName())
                .credits(request.getCredits())
                .maxStudents(request.getMaxStudents())
                .remainingSeats(remaining)
                .build();

        Course saved = courseRepository.save(course);
        return mapToResponse(saved);
    }

    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học với ID: " + id));

        if (!course.getCourseCode().equalsIgnoreCase(request.getCourseCode())
                && courseRepository.existsByCourseCode(request.getCourseCode())) {
            throw new BadRequestException("Mã môn học '" + request.getCourseCode() + "' đã được sử dụng!");
        }

        course.setCourseCode(request.getCourseCode());
        course.setCourseName(request.getCourseName());
        course.setCredits(request.getCredits());
        course.setMaxStudents(request.getMaxStudents());
        if (request.getRemainingSeats() != null) {
            if (request.getRemainingSeats() > request.getMaxStudents()) {
                throw new BadRequestException("Số chỗ còn lại không thể lớn hơn số chỗ tối đa!");
            }
            course.setRemainingSeats(request.getRemainingSeats());
        }

        Course updated = courseRepository.save(course);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy môn học với ID: " + id);
        }
        courseRepository.deleteById(id);
    }

    @Transactional
    public CourseResponse reserveSeat(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học với ID: " + id));

        if (course.getRemainingSeats() <= 0) {
            throw new BadRequestException("Môn học '" + course.getCourseName() + "' đã hết chỗ!");
        }

        course.setRemainingSeats(course.getRemainingSeats() - 1);
        Course updated = courseRepository.save(course);
        return mapToResponse(updated);
    }

    @Transactional
    public CourseResponse releaseSeat(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học với ID: " + id));

        if (course.getRemainingSeats() >= course.getMaxStudents()) {
            throw new BadRequestException("Số chỗ còn lại đã đạt mức tối đa (" + course.getMaxStudents() + ")!");
        }

        course.setRemainingSeats(course.getRemainingSeats() + 1);
        Course updated = courseRepository.save(course);
        return mapToResponse(updated);
    }

    private CourseResponse mapToResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .courseCode(course.getCourseCode())
                .courseName(course.getCourseName())
                .credits(course.getCredits())
                .maxStudents(course.getMaxStudents())
                .remainingSeats(course.getRemainingSeats())
                .build();
    }
}
