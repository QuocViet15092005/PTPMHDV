package com.ptpmhdv.registration.controller;

import com.ptpmhdv.registration.dto.ApiResponse;
import com.ptpmhdv.registration.dto.RegistrationRequest;
import com.ptpmhdv.registration.dto.RegistrationResponse;
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
            @Valid @RequestBody RegistrationRequest request) {
        RegistrationResponse response = registrationService.registerCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đăng ký học phần thành công", response));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các lượt đăng ký học phần")
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getAllRegistrations() {
        List<RegistrationResponse> registrations = registrationService.getAllRegistrations();
        return ResponseEntity.ok(ApiResponse.ok(registrations));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết một bản ghi đăng ký theo ID (Kèm chi tiết Sinh viên và Môn học)")
    public ResponseEntity<ApiResponse<RegistrationResponse>> getRegistrationById(@PathVariable Long id) {
        RegistrationResponse registration = registrationService.getRegistrationById(id);
        return ResponseEntity.ok(ApiResponse.ok(registration));
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Lấy danh sách các môn học đang đăng ký của một sinh viên")
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getRegistrationsByStudent(
            @PathVariable Long studentId) {
        List<RegistrationResponse> list = registrationService.getRegistrationsByStudentId(studentId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Hủy đăng ký học phần (Tự động cập nhật trạng thái CANCELLED và hoàn trả 1 chỗ)")
    public ResponseEntity<ApiResponse<RegistrationResponse>> cancelRegistration(@PathVariable Long id) {
        RegistrationResponse response = registrationService.cancelRegistration(id);
        return ResponseEntity.ok(ApiResponse.ok("Hủy đăng ký học phần thành công", response));
    }
}
