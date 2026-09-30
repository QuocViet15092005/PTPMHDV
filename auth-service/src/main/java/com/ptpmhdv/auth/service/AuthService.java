package com.ptpmhdv.auth.service;

import com.ptpmhdv.auth.client.StudentClient;
import com.ptpmhdv.auth.dto.*;
import com.ptpmhdv.auth.dto.external.StudentCreateRequest;
import com.ptpmhdv.auth.dto.external.StudentResponseDTO;
import com.ptpmhdv.auth.entity.Role;
import com.ptpmhdv.auth.entity.User;
import com.ptpmhdv.auth.exception.BadRequestException;
import com.ptpmhdv.auth.exception.ResourceNotFoundException;
import com.ptpmhdv.auth.repository.UserRepository;
import com.ptpmhdv.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final StudentClient studentClient;

    @Transactional
    public UserDTO register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Tên đăng nhập '" + request.getUsername() + "' đã tồn tại!");
        }

        Role userRole = Role.STUDENT; // ép cứng, bỏ điều kiện đọc từ request

        // Tự động tạo hồ sơ sinh viên bên student-service TRƯỚC khi tạo tài khoản,
        // để đảm bảo tài khoản luôn có studentId hợp lệ ngay khi đăng ký xong.
        // Dùng chính username làm mã sinh viên (khớp với label trên form đăng ký).
        Long studentId;
        try {
            StudentResponseDTO student = studentClient.createStudent(
                    StudentCreateRequest.builder()
                            .studentCode(request.getUsername())
                            .fullName(request.getFullName())
                            .email(request.getEmail())
                            .build()
            );
            studentId = student.getId();
        } catch (Exception e) {
            log.error("Không tạo được hồ sơ sinh viên khi đăng ký username={}: {}", request.getUsername(), e.getMessage());
            throw new BadRequestException("Không thể tạo hồ sơ sinh viên (có thể mã/email đã tồn tại hoặc student-service đang bận). Vui lòng thử lại.");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .studentId(studentId)
                .build();

        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Tên đăng nhập hoặc mật khẩu không chính xác!"));

        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!passwordMatches) {
            throw new BadRequestException("Tên đăng nhập hoặc mật khẩu không chính xác!");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name(), user.getStudentId());
        return AuthResponse.of(token, mapToDTO(user));
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .studentId(user.getStudentId())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
