package com.ptpmhdv.auth.dto;

import com.ptpmhdv.auth.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private Role role;
    private Long studentId;
    private LocalDateTime createdAt;
}
