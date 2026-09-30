package com.ptpmhdv.course.controller;

import com.ptpmhdv.course.dto.ApiResponse;
import com.ptpmhdv.course.dto.CourseRequest;
import com.ptpmhdv.course.dto.CourseResponse;
import com.ptpmhdv.course.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@Tag(name = "Course Controller", description = "Các API Quản lý môn học và số chỗ trống")

public class CourseController {

    private final CourseService courseService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả môn học hoặc tìm kiếm theo từ khóa")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getAllCourses(
            @RequestParam(required = false) String keyword) {
        List<CourseResponse> courses = courseService.getAllCourses(keyword);
        return ResponseEntity.ok(ApiResponse.ok(courses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết môn học theo ID")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseById(@PathVariable Long id) {
        CourseResponse course = courseService.getCourseById(id);
        return ResponseEntity.ok(ApiResponse.ok(course));
    }

    @GetMapping("/code/{courseCode}")
    @Operation(summary = "Xem chi tiết môn học theo Mã môn học")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseByCode(@PathVariable String courseCode) {
        CourseResponse course = courseService.getCourseByCode(courseCode);
        return ResponseEntity.ok(ApiResponse.ok(course));
    }

    @PostMapping
    @Operation(summary = "Thêm mới một môn học")
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(@Valid @RequestBody CourseRequest request) {
        CourseResponse course = courseService.createCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thêm môn học thành công", course));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin môn học")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request) {
        CourseResponse course = courseService.updateCourse(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật môn học thành công", course));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa môn học theo ID")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa môn học thành công", null));
    }

    @PatchMapping("/{id}/reserve-seat")
    @Operation(summary = "Giữ chỗ / trừ 1 chỗ trống của môn học (Được gọi bởi Registration Service)")
    public ResponseEntity<ApiResponse<CourseResponse>> reserveSeat(@PathVariable Long id) {
        CourseResponse course = courseService.reserveSeat(id);
        return ResponseEntity.ok(ApiResponse.ok("Giữ chỗ thành công (số chỗ còn: " + course.getRemainingSeats() + ")", course));
    }

    @PatchMapping("/{id}/release-seat")
    @Operation(summary = "Nhả chỗ / hoàn trả 1 chỗ trống của môn học (Được gọi bởi Registration Service khi hủy môn)")
    public ResponseEntity<ApiResponse<CourseResponse>> releaseSeat(@PathVariable Long id) {
        CourseResponse course = courseService.releaseSeat(id);
        return ResponseEntity.ok(ApiResponse.ok("Hoàn trả chỗ thành công (số chỗ còn: " + course.getRemainingSeats() + ")", course));
    }
}
