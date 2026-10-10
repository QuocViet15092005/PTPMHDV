package com.example.selenium_maven_test.tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class CheckboxFormTest {

    private static final String URL = "file:///D:/Downloads/selenium-maven-test/selenium-maven-test/checkbox_form.html";

    public static void main(String[] args) {
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--remote-allow-origins=*");
        options.addArguments("--disable-notifications");

        WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));

        try {
            driver.manage().window().maximize();

            driver.get(URL);
            System.out.println("Đã mở file HTML local: " + URL);

            WebElement bike = wait.until(
                    ExpectedConditions.presenceOfElementLocated(By.cssSelector("input[value='Bike']"))
            );
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", bike);
            System.out.println("Đã chọn checkbox: Bike");

            WebElement car = wait.until(
                    ExpectedConditions.presenceOfElementLocated(By.cssSelector("input[value='Car']"))
            );
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", car);
            System.out.println("Đã chọn checkbox: Car");

            Thread.sleep(300);

            boolean bikeChecked = bike.isSelected();
            boolean carChecked = car.isSelected();
            System.out.println("Trạng thái Bike: " + bikeChecked);
            System.out.println("Trạng thái Car: " + carChecked);

            WebElement submitBtn = wait.until(
                    ExpectedConditions.presenceOfElementLocated(By.cssSelector("input[type='submit']"))
            );
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", submitBtn);
            System.out.println("Đã click nút Submit");

            wait.until(ExpectedConditions.textToBePresentInElementLocated(
                    By.tagName("body"), "vehicle1=Bike"));

            String bodyText = driver.findElement(By.tagName("body")).getText();
            System.out.println("=== Text thực tế trên trang kết quả ===");
            System.out.println(bodyText);
            System.out.println("=======================================");

            if (bodyText.contains("vehicle1=Bike") && bodyText.contains("vehicle2=Car")) {
                System.out.println("Test Passed: Form submit thành công và dữ liệu checkbox hiển thị đúng");
            } else {
                System.out.println("Test Failed: Thiếu 'vehicle1=Bike' hoặc 'vehicle2=Car'");
                System.out.println("Text thực tế: " + bodyText);
            }

        } catch (Exception e) {
            System.out.println("Test Failed: " + e.getMessage());
            e.printStackTrace();
        } finally {
            driver.quit();
        }
    }
}