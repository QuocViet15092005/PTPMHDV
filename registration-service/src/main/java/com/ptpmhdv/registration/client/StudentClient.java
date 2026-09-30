package com.ptpmhdv.registration.client;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ptpmhdv.registration.dto.ApiResponse;
import com.ptpmhdv.registration.dto.external.StudentDTO;
import com.ptpmhdv.registration.exception.BadRequestException;
import com.ptpmhdv.registration.exception.ResourceNotFoundException;
import com.ptpmhdv.registration.exception.ServiceUnavailableException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class StudentClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Value("${services.student.url:http://student-service}")
    private String studentServiceUrl;

    public StudentDTO getStudentById(Long studentId) {
        String url = studentServiceUrl + "/students/" + studentId;
        try {
            log.info("Gọi sang Student Service: GET {}", url);
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            if (response.getBody() == null) {
                throw new ResourceNotFoundException("Không tìm thấy sinh viên với ID: " + studentId);
            }

            ApiResponse<StudentDTO> apiResponse = objectMapper.readValue(
                    response.getBody(),
                    new TypeReference<ApiResponse<StudentDTO>>() {}
            );

            if (apiResponse != null && apiResponse.isSuccess() && apiResponse.getData() != null) {
                return apiResponse.getData();
            } else {
                throw new ResourceNotFoundException("Không tìm thấy sinh viên với ID: " + studentId);
            }

        } catch (HttpClientErrorException.NotFound ex) {
            log.warn("Student Service trả về 404 cho studentId={}", studentId);
            throw new ResourceNotFoundException("Sinh viên với ID " + studentId + " không tồn tại!");
        } catch (HttpClientErrorException.BadRequest ex) {
            throw new BadRequestException("Lỗi từ Student Service: " + ex.getResponseBodyAsString());
        } catch (ResourceAccessException ex) {
            log.error("Không thể kết nối tới Student Service tại {}: {}", url, ex.getMessage());
            throw new ServiceUnavailableException("Không thể kết nối đến Student Service (Port 8082). Vui lòng kiểm tra lại dịch vụ!");
        } catch (Exception ex) {
            if (ex instanceof ResourceNotFoundException || ex instanceof BadRequestException || ex instanceof ServiceUnavailableException) {
                throw (RuntimeException) ex;
            }
            log.error("Lỗi khi gọi Student Service: {}", ex.getMessage());
            throw new ServiceUnavailableException("Lỗi khi kết nối đến Student Service: " + ex.getMessage());
        }
    }
}
