package com.greennest.controller;

import com.greennest.dto.ReviewRequest;
import com.greennest.dto.ReviewResponse;
import com.greennest.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // GET /api/reviews/product/{productId}
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getProductReviews(
            @PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    // GET /api/reviews/product/{productId}/rating
    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<Map<String, Object>> getProductRating(
            @PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductRating(productId));
    }

    // POST /api/reviews/product/{productId}
    // { "rating": 5, "comment": "Great plant!" }
    @PostMapping("/product/{productId}")
    public ResponseEntity<ReviewResponse> addReview(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest req) {
        return ResponseEntity.ok(reviewService.addReview(user.getUsername(), productId, req));
    }

    // PUT /api/reviews/{reviewId}
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest req) {
        return ResponseEntity.ok(reviewService.updateReview(user.getUsername(), reviewId, req));
    }

    // DELETE /api/reviews/{reviewId}
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Map<String, String>> deleteReview(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long reviewId) {
        reviewService.deleteReview(user.getUsername(), reviewId);
        return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
    }
}
