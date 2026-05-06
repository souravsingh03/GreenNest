package com.greennest.controller;

import com.greennest.service.CartService;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // GET /api/cart
    @GetMapping
    public ResponseEntity<Map<String, Object>> getCart(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(cartService.getCart(user.getUsername()));
    }

    // POST /api/cart/add  { "productId": 1, "quantity": 2 }
    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addItem(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody Map<String, Object> body) {

        Long productId = Long.valueOf(body.get("productId").toString());
        int  quantity  = body.containsKey("quantity")
                ? Integer.parseInt(body.get("quantity").toString()) : 1;

        return ResponseEntity.ok(cartService.addItem(user.getUsername(), productId, quantity));
    }

    // PUT /api/cart/update/{cartItemId}  { "quantity": 3 }
    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<Map<String, Object>> updateItem(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long cartItemId,
            @RequestBody Map<String, Integer> body) {

        int quantity = body.get("quantity");
        if (quantity < 1) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Quantity must be at least 1"));
        }
        return ResponseEntity.ok(cartService.updateItem(user.getUsername(), cartItemId, quantity));
    }

    // DELETE /api/cart/remove/{cartItemId}
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<Map<String, Object>> removeItem(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long cartItemId) {
        return ResponseEntity.ok(cartService.removeItem(user.getUsername(), cartItemId));
    }

    // GET /api/cart/summary  (lightweight — just count + total for navbar)
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getCartSummary(
            @AuthenticationPrincipal UserDetails user) {
        Map<String, Object> full = cartService.getCart(user.getUsername());
        return ResponseEntity.ok(Map.of(
                "totalItems", full.get("totalItems"),
                "totalPrice", full.get("totalPrice"),
                "isEmpty",    full.get("isEmpty")
        ));
    }
}
