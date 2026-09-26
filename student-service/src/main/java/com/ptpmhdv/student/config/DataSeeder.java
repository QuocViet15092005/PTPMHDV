package com.ptpmhdv.student.config;

import com.ptpmhdv.student.entity.News;
import com.ptpmhdv.student.entity.Transaction;
import com.ptpmhdv.student.repository.NewsRepository;
import com.ptpmhdv.student.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final NewsRepository newsRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public void run(String... args) throws Exception {
        if (newsRepository.count() == 0) {
            newsRepository.saveAll(List.of(
                News.builder()
                    .category("Tin nhà trường")
                    .title("Hướng dẫn đăng nhập Wifi: HUNRE SINH VIEN")
                    .content("Để sử dụng hệ thống mạng Wifi của trường, sinh viên vui lòng sử dụng mã sinh viên làm tài khoản đăng nhập.")
                    .publishedDate(LocalDate.now().minusDays(2))
                    .pinned(true)
                    .build(),
                News.builder()
                    .category("Tin nhà trường")
                    .title("Hỗ trợ kỹ thuật về tài khoản của học viên, sinh viên")
                    .content("Mọi vấn đề về tài khoản, mật khẩu, sinh viên vui lòng liên hệ phòng Công tác sinh viên hoặc gửi email về bộ phận IT.")
                    .publishedDate(LocalDate.now().minusDays(5))
                    .pinned(true)
                    .build(),
                News.builder()
                    .category("Tin đào tạo")
                    .title("Phòng Đào tạo thông báo điều chỉnh thời gian đăng ký học và thời khóa biểu dự kiến")
                    .content("Lịch đăng ký học phần cho học kỳ tới sẽ bắt đầu từ 00h00 ngày 10/09. Sinh viên chú ý theo dõi lịch chi tiết.")
                    .publishedDate(LocalDate.now().minusDays(10))
                    .pinned(false)
                    .build(),
                News.builder()
                    .category("Sự kiện")
                    .title("Hội thảo: Định hướng nghề nghiệp ngành CNTT")
                    .content("Tham gia hội thảo để giao lưu cùng các chuyên gia hàng đầu đến từ các công ty công nghệ lớn.")
                    .publishedDate(LocalDate.now().plusDays(5))
                    .pinned(false)
                    .build()
            ));
        }

        if (transactionRepository.count() == 0) {
            // Seed for the default student "SV001" and "SV002"
            transactionRepository.saveAll(List.of(
                Transaction.builder()
                    .id("GD" + System.currentTimeMillis() + "1")
                    .studentId("SV001")
                    .type("Thanh toán học phí HK1")
                    .amount(new BigDecimal("4500000"))
                    .status("Thành công")
                    .transactionDate(LocalDate.now().minusDays(15))
                    .build(),
                Transaction.builder()
                    .id("GD" + System.currentTimeMillis() + "2")
                    .studentId("SV001")
                    .type("Thanh toán học phí HK2")
                    .amount(new BigDecimal("4500000"))
                    .status("Thành công")
                    .transactionDate(LocalDate.now().minusMonths(6))
                    .build(),
                Transaction.builder()
                    .id("GD" + System.currentTimeMillis() + "3")
                    .studentId("SV002")
                    .type("Thanh toán học phí HK1")
                    .amount(new BigDecimal("4200000"))
                    .status("Thành công")
                    .transactionDate(LocalDate.now().minusDays(20))
                    .build()
            ));
        }
    }
}
