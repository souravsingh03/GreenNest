package com.greennest.service;

import com.greennest.model.*;
import com.greennest.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public List<Map<String, Object>> getWishlist(String email) {
        User user = getUser(email);
        return wishlistRepository.findByUserId(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> toggleWishlist(String email, Long productId) {
        User user = getUser(email);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));

        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
            return Map.of("action", "REMOVED", "productId", productId,
                          "message", product.getName() + " removed from wishlist");
        } else {
            Wishlist w = Wishlist.builder().user(user).product(product).build();
            wishlistRepository.save(w);
            return Map.of("action", "ADDED", "productId", productId,
                          "message", product.getName() + " added to wishlist");
        }
    }

    @Transactional
    public Map<String, Object> removeFromWishlist(String email, Long productId) {
        User user = getUser(email);
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
        return Map.of("message", "Removed from wishlist", "productId", productId);
    }

    public boolean isInWishlist(String email, Long productId) {
        User user = getUser(email);
        return wishlistRepository.existsByUserIdAndProductId(user.getId(), productId);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    private Map<String, Object> toResponse(Wishlist w) {
        Product p = w.getProduct();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("wishlistId",  w.getId());
        m.put("productId",   p.getId());
        m.put("name",        p.getName());
        m.put("price",       p.getPrice());
        m.put("imageUrl",    p.getImageUrl());
        m.put("category",    p.getCategory().name());
        m.put("stock",       p.getStock());
        m.put("inStock",     p.getStock() > 0);
        m.put("addedAt",     w.getAddedAt());
        return m;
    }
}
