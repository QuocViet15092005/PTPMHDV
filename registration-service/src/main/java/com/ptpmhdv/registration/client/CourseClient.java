package com.ptpmhdv.registration.client;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ptpmhdv.registration.dto.ApiResponse;
import com.ptpmhdv.registration.dto.external.CourseDTO;
import com.ptpmhdv.registration.exception.BadRequestException;
import com.ptpmhdv.registration.exception.ResourceNotFoundException;
import com.ptpmhdv.registration.exception.ServiceUnavailableException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class CourseClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Value("${services.course.url:http://course-service}")
    private String courseServiceUrl;

    public CourseDTO getCourseById(Long courseId) {
        String url = courseServiceUrl + "/courses/" + courseId;
        try {
            log.info("Gọi sang Course Service: GET {}", url);
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            if (response.getBody() == null) {
                throw new ResourceNotFoundException("Không tìm thấy môn học với ID: " + courseId);
            }

            ApiResponse<CourseDTO> apiResponse = objectMapper.readValue(
                    response.getBody(),
                    new TypeReference<ApiResponse<CourseDTO>>() {}
            );

            if (apiResponse != null && apiResponse.isSuccess() && apiResponse.getData() != null) {
                return apiResponse.getData();
            } else {
                throw new ResourceNotFoundException("Không tìm thấy môn học với ID: " + courseId);
            }

        } catch (HttpClientErrorException.NotFound ex) {
            log.warn("Course Service trả về 404 cho courseId={}", courseId);
            throw new ResourceNotFoundException("Môn học với ID " + courseId + " không tồn tại!");
        } catch (HttpClientErrorException.BadRequest ex) {
            throw new BadRequestException("Lỗi từ Course Service: " + ex.getResponseBodyAsString());
        } catch (ResourceAccessException ex) {
            log.error("Không thể kết nối tới Course Service tại {}: {}", url, ex.getMessage());
            throw new ServiceUnavailableException("Không thể kết nối đến Course Service (Port 8083). Vui lòng kiểm tra lại dịch vụ!");
        } catch (Exception ex) {
            if (ex instanceof ResourceNotFoundException || ex instanceof BadRequestException || ex instanceof ServiceUnavailableException) {
                throw (RuntimeException) ex;
            }
            log.error("Lỗi khi gọi Course Service: {}", ex.getMessage());
            throw new ServiceUnavailableException("Lỗi khi kết nối đến Course Service: " + ex.getMessage());
        }
    }

    public CourseDTO reserveSeat(Long courseId) {
        String url = courseServiceUrl + "/courses/" + courseId + "/reserve-seat";
        try {
            log.info("Gọi sang Course Service: PATCH {}", url);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.PATCH,
                    requestEntity,
                    String.class
            );

            ApiResponse<CourseDTO> apiResponse = objectMapper.readValue(
                    response.getBody(),
                    new TypeReference<ApiResponse<CourseDTO>>() {}
            );

            if (apiResponse != null && apiResponse.isSuccess() && apiResponse.getData() != null) {
                return apiResponse.getData();
            } else {
                throw new BadRequestException("Không thể giữ chỗ môn học ID: " + courseId);
            }

        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("Môn học với ID " + courseId + " không tồn tại!");
        } catch (HttpClientErrorException.BadRequest ex) {
            throw new BadRequestException("Môn học ID " + courseId + " đã hết chỗ trống hoặc dữ liệu không hợp lệ!");
        } catch (ResourceAccessException ex) {
            throw new ServiceUnavailableException("Không thể kết nối đến Course Service (Port 8083) để giữ chỗ!");
        } catch (Exception ex) {
            if (ex instanceof ResourceNotFoundException || ex instanceof BadRequestException || ex instanceof ServiceUnavailableException) {
                throw (RuntimeException) ex;
            }
            throw new ServiceUnavailableException("Lỗi khi thực hiện giữ chỗ môn học: " + ex.getMessage());
        }
    }

    public CourseDTO releaseSeat(Long courseId) {
        String url = courseServiceUrl + "/courses/" + courseId + "/release-seat";
        try {
            log.info("Gọi sang Course Service: PATCH {}", url);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.PATCH,
                    requestEntity,
                    String.class
            );

            ApiResponse<CourseDTO> apiResponse = objectMapper.readValue(
                    response.getBody(),
                    new TypeReference<ApiResponse<CourseDTO>>() {}
            );

            if (apiResponse != null && apiResponse.isSuccess() && apiResponse.getData() != null) {
                return apiResponse.getData();
            } else {
                throw new BadRequestException("Không thể hoàn trả chỗ môn học ID: " + courseId);
            }

        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("Môn học với ID " + courseId + " không tồn tại!");
        } catch (HttpClientErrorException.BadRequest ex) {
            throw new BadRequestException("Không thể hoàn trả chỗ: " + ex.getResponseBodyAsString());
        } catch (ResourceAccessException ex) {
            throw new ServiceUnavailableException("Không thể kết nối đến Course Service (Port 8083) để hoàn trả chỗ!");
        } catch (Exception ex) {
            if (ex instanceof ResourceNotFoundException || ex instanceof BadRequestException || ex instanceof ServiceUnavailableException) {
                throw (RuntimeException) ex;
            }
            throw new ServiceUnavailableException("Lỗi khi thực hiện hoàn trả chỗ môn học: " + ex.getMessage());
        }
    }
}
