package com.ptpmhdv.auth.controller;

import com.ptpmhdv.auth.dto.ApiResponse;
import com.ptpmhdv.auth.dto.AuthResponse;
import com.ptpmhdv.auth.dto.LoginRequest;
import com.ptpmhdv.auth.dto.RegisterRequest;
import com.ptpmhdv.auth.dto.UserDTO;
import com.ptpmhdv.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication Controller", description = "Các API xác thực và đăng ký tài khoản")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản người dùng mới")
    public ResponseEntity<ApiResponse<UserDTO>> register(@Valid @RequestBody RegisterRequest request) {
        UserDTO user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đăng ký tài khoản thành công", user));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập hệ thống, nhận JWT Token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", response));
    }
}
