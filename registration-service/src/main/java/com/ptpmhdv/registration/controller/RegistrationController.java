package com.ptpmhdv.registration.controller;

import com.ptpmhdv.registration.dto.ApiResponse;
import com.ptpmhdv.registration.dto.RegistrationRequest;
import com.ptpmhdv.registration.dto.RegistrationResponse;
import com.ptpmhdv.registration.dto.GradeRequest;
import com.ptpmhdv.registration.service.RegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/registrations")
@RequiredArgsConstructor
@Tag(name = "Registration Controller", description = "Các API Đăng ký và Hủy học phần (Tích hợp Microservices)")

public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping
    @Operation(summary = "Đăng ký học phần cho sinh viên (Tự động kiểm tra SV, Môn học, Chỗ trống và trừ chỗ)")
    public ResponseEntity<ApiResponse<RegistrationResponse>> registerCourse(
            @RequestHeader("X-Auth-Role") String role,
            @RequestHeader("X-Auth-Username") String username,
            @Valid @RequestBody RegistrationRequest request) {
        RegistrationResponse response = registrationService.registerCourse(request, role, username);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đăng ký học phần thành công", response));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các lượt đăng ký học phần")
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getAllRegistrations(
            @RequestHeader(value = "X-Auth-Role", required = false) String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Chỉ admin được xem toàn bộ đăng ký"));
        }
        List<RegistrationResponse> registrations = registrationService.getAllRegistrations();
        return ResponseEntity.ok(ApiResponse.ok(registrations));
    }

    @GetMapping("/grades")
    @Operation(summary = "Admin xem các đăng ký còn hiệu lực để nhập điểm")
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getGradingRegistrations(
            @RequestHeader(value = "X-Auth-Role", required = false) String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Chỉ admin được quản lý điểm"));
        }
        return ResponseEntity.ok(ApiResponse.ok(registrationService.getGradingRegistrations()));
    }

    @GetMapping("/{id:[0-9]+}")
    @Operation(summary = "Xem chi tiết một bản ghi đăng ký theo ID (Kèm chi tiết Sinh viên và Môn học)")
    public ResponseEntity<ApiResponse<RegistrationResponse>> getRegistrationById(
            @PathVariable Long id,
            @RequestHeader(value = "X-Auth-Role", required = false) String role,
            @RequestHeader(value = "X-Auth-StudentId", required = false) Long authenticatedStudentId) {
        RegistrationResponse registration = registrationService.getRegistrationById(id);
        if (!canRead(role, authenticatedStudentId, registration.getStudentId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Không có quyền xem đăng ký này"));
        }
        return ResponseEntity.ok(ApiResponse.ok(registration));
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Lấy danh sách các môn học đang đăng ký của một sinh viên")
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getRegistrationsByStudent(
            @PathVariable Long studentId,
            @RequestHeader(value = "X-Auth-Role", required = false) String role,
            @RequestHeader(value = "X-Auth-StudentId", required = false) Long authenticatedStudentId) {
        if (!canRead(role, authenticatedStudentId, studentId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Chỉ được xem kết quả học tập của mình"));
        }
        List<RegistrationResponse> list = registrationService.getRegistrationsByStudentId(studentId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @DeleteMapping("/{id:[0-9]+}")
    @Operation(summary = "Hủy đăng ký học phần (Tự động cập nhật trạng thái CANCELLED và hoàn trả 1 chỗ)")
    public ResponseEntity<ApiResponse<RegistrationResponse>> cancelRegistration(@PathVariable Long id) {
        RegistrationResponse response = registrationService.cancelRegistration(id);
        return ResponseEntity.ok(ApiResponse.ok("Hủy đăng ký học phần thành công", response));
    }

    @PutMapping("/{id}/grade")
    @Operation(summary = "Admin nhập hoặc sửa điểm hệ 10 cho học phần đã đăng ký")
    public ResponseEntity<ApiResponse<RegistrationResponse>> updateGrade(
            @PathVariable Long id,
            @RequestHeader(value = "X-Auth-Role", required = false) String role,
            @Valid @RequestBody GradeRequest request) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Chỉ admin được nhập điểm"));
        }
        return ResponseEntity.ok(ApiResponse.ok("Lưu điểm thành công",
                registrationService.updateGrade(id, request.getScore())));
    }

    private boolean canRead(String role, Long authenticatedStudentId, Long studentId) {
        return "ADMIN".equals(role) || ("STUDENT".equals(role) && studentId != null
                && studentId.equals(authenticatedStudentId));
    }
}
