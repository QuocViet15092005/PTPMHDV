package com.ptpmhdv.student.controller;

import com.ptpmhdv.student.dto.ApiResponse;
import com.ptpmhdv.student.dto.StudentRequest;
import com.ptpmhdv.student.dto.StudentResponse;
import com.ptpmhdv.student.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
@Tag(name = "Student Controller", description = "Các API Quản lý thông tin sinh viên")

public class StudentController {

    private final StudentService studentService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả sinh viên hoặc tìm kiếm theo từ khóa")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getAllStudents(
            @RequestHeader(value = "X-Auth-Role", required = false) String role,
            @RequestParam(required = false) String keyword) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Không có quyền truy cập"));
        }
        List<StudentResponse> students = studentService.getAllStudents(keyword);
        return ResponseEntity.ok(ApiResponse.ok(students));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết sinh viên theo ID")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudentById(
            @RequestHeader(value = "X-Auth-Role", required = false) String role,
            @RequestHeader(value = "X-Auth-Username", required = false) String username,
            @PathVariable Long id) {
        StudentResponse student = studentService.getStudentById(id);
        if (!"ADMIN".equals(role) && !student.getStudentCode().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Không có quyền truy cập"));
        }
        return ResponseEntity.ok(ApiResponse.ok(student));
    }

    @GetMapping("/code/{studentCode}")
    @Operation(summary = "Xem chi tiết sinh viên theo Mã sinh viên")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudentByCode(
            @RequestHeader(value = "X-Auth-Role", required = false) String role,
            @RequestHeader(value = "X-Auth-Username", required = false) String username,
            @PathVariable String studentCode) {
        if (!"ADMIN".equals(role) && !studentCode.equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Không có quyền truy cập"));
        }
        StudentResponse student = studentService.getStudentByCode(studentCode);
        return ResponseEntity.ok(ApiResponse.ok(student));
    }

    @PostMapping
    @Operation(summary = "Thêm mới một sinh viên")
    public ResponseEntity<ApiResponse<StudentResponse>> createStudent(
            @RequestHeader(value = "X-Auth-Role", required = false) String role,
            @Valid @RequestBody StudentRequest request) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Không có quyền truy cập"));
        }
        StudentResponse student = studentService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thêm sinh viên thành công", student));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin sinh viên")
    public ResponseEntity<ApiResponse<StudentResponse>> updateStudent(
            @RequestHeader(value = "X-Auth-Role", required = false) String role,
            @RequestHeader(value = "X-Auth-Username", required = false) String username,
            @PathVariable Long id,
            @Valid @RequestBody StudentRequest request) {
        StudentResponse student = studentService.getStudentById(id);
        if (!"ADMIN".equals(role) && !student.getStudentCode().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Không có quyền truy cập"));
        }
        StudentResponse updatedStudent = studentService.updateStudent(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật sinh viên thành công", updatedStudent));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa sinh viên theo ID")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(
            @RequestHeader(value = "X-Auth-Role", required = false) String role,
            @PathVariable Long id) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Không có quyền truy cập"));
        }
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa sinh viên thành công", null));
    }
}
