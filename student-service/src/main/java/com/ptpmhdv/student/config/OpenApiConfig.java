package com.ptpmhdv.student.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI studentServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Student Service API - Quản lý Sinh viên")
                        .description("Microservice phụ trách quản lý hồ sơ sinh viên, thông tin lớp học, tra cứu và xác thực thông tin sinh viên.")
                        .version("1.0.0")
                        .contact(new Contact().name("Nhóm Phát Triển Phần Mềm Hướng Dịch Vụ"))
                        .license(new License().name("Apache 2.0")));
    }
}
