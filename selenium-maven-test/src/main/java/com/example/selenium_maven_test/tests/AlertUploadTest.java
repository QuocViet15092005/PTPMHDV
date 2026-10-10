package com.example.selenium_maven_test.tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.File;
import java.time.Duration;

public class AlertUploadTest {

    private static final String FILE_PATH = "C:\\Users\\Public\\image.jpg";

    private static final String UPLOAD_URL = "file:///D:/Downloads/selenium-maven-test/selenium-maven-test/upload_form.html";

    public static void main(String[] args) {
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--remote-allow-origins=*");
        options.addArguments("--disable-notifications");

        WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));

        boolean alertPassed = false;
        boolean uploadPassed = false;

        try {
            driver.manage().window().maximize();

            System.out.println("===== PHẦN 1: CONFIRMATION ALERT =====");
            driver.get("https://www.w3schools.com/js/tryit.asp?filename=tryjs_confirm");
            System.out.println("Đã mở trang confirm");

            wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt(By.id("iframeResult")));
            System.out.println("Đã switch vào iframe");

            WebElement tryItBtn = wait.until(
                    ExpectedConditions.presenceOfElementLocated(By.xpath("//button[text()='Try it']"))
            );
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", tryItBtn);
            System.out.println("Đã click nút 'Try it'");

            wait.until(ExpectedConditions.alertIsPresent());
            Alert alert = driver.switchTo().alert();
            System.out.println("Alert text: " + alert.getText());
            alert.accept();
            System.out.println("Đã nhấn OK trên alert");

            wait.until(ExpectedConditions.textToBePresentInElementLocated(
                    By.id("demo"), "You pressed OK!"));

            String demoText = driver.findElement(By.id("demo")).getText();
            System.out.println("Text sau alert: " + demoText);

            if (demoText.contains("You pressed OK!")) {
                alertPassed = true;
                System.out.println("✔ Alert test PASSED");
            } else {
                System.out.println("✘ Alert test FAILED - Text thực tế: " + demoText);
            }

            driver.switchTo().defaultContent();

            System.out.println("\n===== PHẦN 2: UPLOAD FILE =====");
            driver.get(UPLOAD_URL);
            System.out.println("Đã mở file HTML local upload: " + UPLOAD_URL);

            File file = new File(FILE_PATH);
            if (!file.exists()) {
                System.out.println("✘ File không tồn tại: " + FILE_PATH);
                System.out.println("  Vui lòng tạo file ảnh mẫu tại đường dẫn trên.");
            } else {
                WebElement fileInput = wait.until(
                        ExpectedConditions.presenceOfElementLocated(By.id("myFile"))
                );
                fileInput.sendKeys(FILE_PATH);
                System.out.println("Đã upload file: " + FILE_PATH);

                Thread.sleep(1000);

                String fileName = fileInput.getAttribute("value");
                System.out.println("File name hiển thị: " + fileName);

                if (fileName != null && fileName.contains("image.jpg")) {
                    uploadPassed = true;
                    System.out.println("✔ Upload test PASSED");
                } else {
                    System.out.println("✘ Upload test FAILED - Value thực tế: " + fileName);
                }
            }

            System.out.println("\n========== KẾT QUẢ TỔNG HỢP ==========");
            if (alertPassed && uploadPassed) {
                System.out.println("Test Passed: Confirmation alert và upload xử lý thành công");
            } else {
                System.out.println("Test Failed: Alert=" + alertPassed + ", Upload=" + uploadPassed);
            }

        } catch (Exception e) {
            System.out.println("Test Failed: " + e.getMessage());
            e.printStackTrace();
        } finally {
            driver.quit();
        }
    }
}