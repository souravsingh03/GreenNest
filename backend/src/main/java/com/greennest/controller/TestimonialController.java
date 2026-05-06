package com.greennest.controller;

import com.greennest.service.TestimonialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/testimonials")
@RequiredArgsConstructor
public class TestimonialController {

    private final TestimonialService testimonialService;

    // GET /api/testimonials — public, approved only
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getApproved() {
        return ResponseEntity.ok(testimonialService.getApprovedTestimonials());
    }

    // POST /api/testimonials — authenticated users
    @PostMapping
    public ResponseEntity<Map<String, Object>> submit(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {

        String quote = body.get("quote").toString();
        int rating = body.containsKey("rating")
                ? Integer.parseInt(body.get("rating").toString()) : 5;

        return ResponseEntity.ok(
                testimonialService.submitTestimonial(userDetails.getUsername(), quote, rating));
    }

    // ── Admin endpoints ──────────────────────────────────────────────────────

    // GET /api/testimonials/all — admin sees all (pending + approved)
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        return ResponseEntity.ok(testimonialService.getAllTestimonials());
    }

    // PATCH /api/testimonials/{id}/approve
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(testimonialService.approveTestimonial(id));
    }

    // DELETE /api/testimonials/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        testimonialService.deleteTestimonial(id);
        return ResponseEntity.ok(Map.of("message", "Testimonial deleted"));
    }
}
