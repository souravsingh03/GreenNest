package com.greennest.controller;

import com.greennest.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    // GET /api/wishlist
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getWishlist(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(wishlistService.getWishlist(user.getUsername()));
    }

    // POST /api/wishlist/toggle/{productId}  — adds if not present, removes if present
    @PostMapping("/toggle/{productId}")
    public ResponseEntity<Map<String, Object>> toggle(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long productId) {
        return ResponseEntity.ok(wishlistService.toggleWishlist(user.getUsername(), productId));
    }

    // DELETE /api/wishlist/{productId}
    @DeleteMapping("/{productId}")
    public ResponseEntity<Map<String, Object>> remove(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long productId) {
        return ResponseEntity.ok(wishlistService.removeFromWishlist(user.getUsername(), productId));
    }

    // GET /api/wishlist/check/{productId}  — returns true/false
    @GetMapping("/check/{productId}")
    public ResponseEntity<Map<String, Object>> check(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long productId) {
        boolean inWishlist = wishlistService.isInWishlist(user.getUsername(), productId);
        return ResponseEntity.ok(Map.of("productId", productId, "inWishlist", inWishlist));
    }
}
