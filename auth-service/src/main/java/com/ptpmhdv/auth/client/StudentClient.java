package com.ptpmhdv.auth.client;

import com.ptpmhdv.auth.dto.external.ApiResponseWrapper;
import com.ptpmhdv.auth.dto.external.StudentCreateRequest;
import com.ptpmhdv.auth.dto.external.StudentResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class StudentClient {

    private final RestTemplate restTemplate;

    @Value("${services.student.url}")
    private String studentServiceUrl;

    /**
     * Tạo hồ sơ sinh viên bên student-service. Trả về id sinh viên vừa tạo.
     * Ném RuntimeException nếu student-service không phản hồi hoặc trả lỗi
     * (ví dụ studentCode đã tồn tại) để AuthService bên trên xử lý rollback.
     */
    public StudentResponseDTO createStudent(StudentCreateRequest request) {
        HttpEntity<StudentCreateRequest> entity = new HttpEntity<>(request);

        var response = restTemplate.exchange(
                studentServiceUrl + "/students",
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<ApiResponseWrapper<StudentResponseDTO>>() {}
        );

        if (response.getBody() == null || response.getBody().getData() == null) {
            throw new RuntimeException("student-service không trả về dữ liệu hồ sơ sinh viên");
        }

        return response.getBody().getData();
    }
}
