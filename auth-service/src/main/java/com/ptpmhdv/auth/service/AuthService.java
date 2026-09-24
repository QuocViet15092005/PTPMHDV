package com.ptpmhdv.auth.service;

import com.ptpmhdv.auth.dto.*;
import com.ptpmhdv.auth.entity.Role;
import com.ptpmhdv.auth.entity.User;
import com.ptpmhdv.auth.exception.BadRequestException;
import com.ptpmhdv.auth.exception.ResourceNotFoundException;
import com.ptpmhdv.auth.repository.UserRepository;
import com.ptpmhdv.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public UserDTO register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Tên đăng nhập '" + request.getUsername() + "' đã tồn tại!");
        }

        Role userRole = (request.getRole() != null) ? request.getRole() : Role.STUDENT;

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .studentId(request.getStudentId())
                .build();

        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Tên đăng nhập hoặc mật khẩu không chính xác!"));

        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword())
                || request.getPassword().equals(user.getPassword());

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
