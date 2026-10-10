package com.example.selenium_maven_test.tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class DropdownFormTest {

    private static final String URL = "file:///D:/Downloads/selenium-maven-test/selenium-maven-test/dropdown_form.html";

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

            WebElement dropdown = wait.until(
                    ExpectedConditions.presenceOfElementLocated(By.name("cars"))
            );
            Select select = new Select(dropdown);
            select.selectByVisibleText("Volvo");
            System.out.println("Đã chọn option: Volvo");

            WebElement submitBtn = wait.until(
                    ExpectedConditions.presenceOfElementLocated(By.cssSelector("input[type='submit']"))
            );
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", submitBtn);
            System.out.println("Đã click nút Submit");

            wait.until(ExpectedConditions.textToBePresentInElementLocated(
                    By.tagName("body"), "cars=volvo"));

            String bodyText = driver.findElement(By.tagName("body")).getText();
            System.out.println("=== Text thực tế ===");
            System.out.println(bodyText);

            if (bodyText.toLowerCase().contains("cars=volvo")) {
                System.out.println("Test Passed: Form submit thành công và dữ liệu dropdown hiển thị đúng");
            } else {
                System.out.println("Test Failed: Không tìm thấy 'cars=volvo'");
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