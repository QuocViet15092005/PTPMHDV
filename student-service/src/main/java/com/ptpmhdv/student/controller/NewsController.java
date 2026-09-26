package com.ptpmhdv.student.controller;

import com.ptpmhdv.student.entity.News;
import com.ptpmhdv.student.repository.NewsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsRepository newsRepository;

    @GetMapping
    public List<News> getNews() {
        return newsRepository.findAllByOrderByPinnedDescPublishedDateDesc();
    }

    @PostMapping
    public News createNews(@RequestBody News news) {
        if (news.getPublishedDate() == null) {
            news.setPublishedDate(LocalDate.now());
        }
        return newsRepository.save(news);
    }

    @PutMapping("/{id}")
    public News updateNews(@PathVariable Long id, @RequestBody News news) {
        return newsRepository.findById(id).map(existing -> {
            existing.setTitle(news.getTitle());
            existing.setCategory(news.getCategory());
            existing.setContent(news.getContent());
            existing.setPinned(news.getPinned());
            return newsRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("News not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteNews(@PathVariable Long id) {
        newsRepository.deleteById(id);
    }
}
