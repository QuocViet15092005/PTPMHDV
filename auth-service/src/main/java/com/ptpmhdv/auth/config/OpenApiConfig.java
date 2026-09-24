package com.ptpmhdv.auth.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI authServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Auth Service API - Hệ thống Đăng ký học phần")
                        .description("Microservice phụ trách Đăng ký, Đăng nhập, Xác thực JWT và Quản lý tài khoản người dùng.")
                        .version("1.0.0")
                        .contact(new Contact().name("Nhóm Phát Triển Phần Mềm Hướng Dịch Vụ"))
                        .license(new License().name("Apache 2.0")));
    }
}
