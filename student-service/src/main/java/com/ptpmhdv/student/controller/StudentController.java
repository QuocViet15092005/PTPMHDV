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
            @RequestParam(required = false) String keyword) {
        List<StudentResponse> students = studentService.getAllStudents(keyword);
        return ResponseEntity.ok(ApiResponse.ok(students));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết sinh viên theo ID")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudentById(@PathVariable Long id) {
        StudentResponse student = studentService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.ok(student));
    }

    @GetMapping("/code/{studentCode}")
    @Operation(summary = "Xem chi tiết sinh viên theo Mã sinh viên")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudentByCode(@PathVariable String studentCode) {
        StudentResponse student = studentService.getStudentByCode(studentCode);
        return ResponseEntity.ok(ApiResponse.ok(student));
    }

    @PostMapping
    @Operation(summary = "Thêm mới một sinh viên")
    public ResponseEntity<ApiResponse<StudentResponse>> createStudent(@Valid @RequestBody StudentRequest request) {
        StudentResponse student = studentService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thêm sinh viên thành công", student));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin sinh viên")
    public ResponseEntity<ApiResponse<StudentResponse>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequest request) {
        StudentResponse student = studentService.updateStudent(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật sinh viên thành công", student));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa sinh viên theo ID")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa sinh viên thành công", null));
    }
}
