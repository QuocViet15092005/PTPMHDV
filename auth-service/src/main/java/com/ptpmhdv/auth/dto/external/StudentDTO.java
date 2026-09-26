package com.ptpmhdv.auth.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDTO {
    private Long id;
    private String studentCode;
    private String fullName;
    private String email;
    private String phone;
    private String className;
    private String status;
}
