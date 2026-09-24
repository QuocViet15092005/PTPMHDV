package com.ptpmhdv.student.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentRequest {

    @NotBlank(message = "Mã sinh viên không được để trống")
    @Size(min = 3, max = 20, message = "Mã sinh viên phải từ 3 đến 20 ký tự")
    private String studentCode;

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100, message = "Họ tên không được vượt quá 100 ký tự")
    private String fullName;

    private LocalDate dateOfBirth;

    private String gender;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @Pattern(regexp = "^$|^[0-9]{9,11}$", message = "Số điện thoại phải từ 9 đến 11 chữ số")
    private String phone;

    private String className;

    private String status;
}
