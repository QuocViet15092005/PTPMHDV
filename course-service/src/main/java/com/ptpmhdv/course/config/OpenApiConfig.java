package com.ptpmhdv.course.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI courseServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Course Service API - Quản lý Học phần và Chỗ trống")
                        .description("Microservice phụ trách môn học/học phần, số tín chỉ, số chỗ tối đa, số chỗ còn lại, hỗ trợ đặt chỗ (reserve) và nhả chỗ (release).")
                        .version("1.0.0")
                        .contact(new Contact().name("Nhóm Phát Triển Phần Mềm Hướng Dịch Vụ"))
                        .license(new License().name("Apache 2.0")));
    }
}
