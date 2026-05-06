package com.greennest.service;

import com.greennest.dto.ReviewRequest;
import com.greennest.dto.ReviewResponse;
import com.greennest.model.*;
import com.greennest.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public List<ReviewResponse> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Map<String, Object> getProductRating(Long productId) {
        Double avg = reviewRepository.findAverageRatingByProductId(productId);
        Long count = reviewRepository.countByProductId(productId);
        return Map.of(
                "productId",     productId,
                "averageRating", avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0,
                "reviewCount",   count != null ? count : 0L
        );
    }

    @Transactional
    public ReviewResponse addReview(String email, Long productId, ReviewRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));

        // One review per user per product
        if (reviewRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new IllegalStateException("You have already reviewed this product. Edit your existing review.");
        }

        // Check user has ordered this product
        boolean hasPurchased = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .anyMatch(order -> order.getStatus() == Order.OrderStatus.DELIVERED &&
                        order.getItems().stream()
                                .anyMatch(item -> item.getProduct().getId().equals(productId)));

        if (!hasPurchased) {
            throw new IllegalStateException("You can only review products you have purchased and received.");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(req.getRating())
                .comment(req.getComment())
                .build();

        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse updateReview(String email, Long reviewId, ReviewRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new SecurityException("You can only edit your own reviews");
        }

        review.setRating(req.getRating());
        review.setComment(req.getComment());
        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(String email, Long reviewId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new SecurityException("You can only delete your own reviews");
        }
        reviewRepository.delete(review);
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .userName(r.getUser().getName())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
