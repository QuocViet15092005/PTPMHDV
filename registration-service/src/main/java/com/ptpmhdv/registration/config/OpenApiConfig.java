package com.ptpmhdv.registration.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI registrationServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Registration Service API - Đăng ký & Hủy Học phần")
                        .description("Microservice trung tâm phụ trách điều phối Đăng ký/Hủy học phần, gọi Student Service và Course Service qua REST API, kiểm tra ràng buộc nghiệp vụ và cập nhật chỗ.")
                        .version("1.0.0")
                        .contact(new Contact().name("Nhóm Phát Triển Phần Mềm Hướng Dịch Vụ"))
                        .license(new License().name("Apache 2.0")));
    }
}
