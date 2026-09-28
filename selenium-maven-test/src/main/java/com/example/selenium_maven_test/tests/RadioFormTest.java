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

public class RadioFormTest {

    public static void main(String[] args) {
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--remote-allow-origins=*");
        options.addArguments("--disable-notifications");

        WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));

        try {
            driver.manage().window().maximize();
            driver.get("https://www.w3schools.com/html/tryit.asp?filename=tryhtml_form_radio");
            System.out.println("Đã mở trang");

            wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt(By.id("iframeResult")));
            System.out.println("Đã switch vào iframe");

            WebElement htmlRadio = wait.until(
                    ExpectedConditions.presenceOfElementLocated(By.cssSelector("input[value='HTML']"))
            );
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", htmlRadio);
            System.out.println("Đã click radio button: HTML");

            Thread.sleep(500);

            if (htmlRadio.isSelected()) {
                System.out.println("Test Passed: Radio button 'HTML' đã được chọn thành công");
            } else {
                System.out.println("Test Failed: Radio button 'HTML' chưa được chọn");
            }

            WebElement cssRadio = driver.findElement(By.cssSelector("input[value='CSS']"));
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", cssRadio);
            Thread.sleep(300);

            if (cssRadio.isSelected() && !htmlRadio.isSelected()) {
                System.out.println("Test Passed: Radio button 'CSS' được chọn, 'HTML' tự động bỏ chọn");
            }

        } catch (Exception e) {
            System.out.println("Test Failed: " + e.getMessage());
            e.printStackTrace();
        } finally {
            driver.quit();
        }
    }
}