package com.greennest.service;

import com.greennest.model.Testimonial;
import com.greennest.model.User;
import com.greennest.repository.TestimonialRepository;
import com.greennest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestimonialService {

    private final TestimonialRepository testimonialRepository;
    private final UserRepository userRepository;

    public List<Map<String, Object>> getApprovedTestimonials() {
        return testimonialRepository.findByIsApprovedTrueOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAllTestimonials() {
        return testimonialRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> submitTestimonial(String email, String quote, int rating) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Testimonial testimonial = Testimonial.builder()
                .user(user)
                .quote(quote)
                .rating(rating)
                .isApproved(false) // requires admin approval
                .build();

        return toResponse(testimonialRepository.save(testimonial));
    }

    @Transactional
    public Map<String, Object> approveTestimonial(Long id) {
        Testimonial t = testimonialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Testimonial not found: " + id));
        t.setIsApproved(true);
        return toResponse(testimonialRepository.save(t));
    }

    @Transactional
    public void deleteTestimonial(Long id) {
        testimonialRepository.deleteById(id);
    }

    private Map<String, Object> toResponse(Testimonial t) {
        return Map.of(
                "id", t.getId(),
                "authorName", t.getUser() != null ? t.getUser().getName() : "Anonymous",
                "quote", t.getQuote(),
                "rating", t.getRating(),
                "isApproved", t.getIsApproved(),
                "createdAt", t.getCreatedAt().toString()
        );
    }
}
