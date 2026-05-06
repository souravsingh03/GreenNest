package com.greennest.controller;

import com.greennest.dto.CheckoutRequest;
import com.greennest.model.Order;
import com.greennest.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // POST /api/orders/checkout
    // { "shippingAddress": "...", "couponCode": "SAVE10", "paymentMethod": "COD" }
    @PostMapping("/checkout")
    public ResponseEntity<Map<String, Object>> checkout(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody CheckoutRequest req) {

        return ResponseEntity.ok(orderService.checkout(
                user.getUsername(),
                req.getShippingAddress(),
                req.getCouponCode(),
                req.getPaymentMethod()));
    }

    // GET /api/orders  — logged-in user's own orders
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getMyOrders(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(orderService.getOrderHistory(user.getUsername()));
    }

    // GET /api/orders/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getOrder(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(user.getUsername(), id));
    }

    // POST /api/orders/{id}/cancel
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelOrder(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(user.getUsername(), id));
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    // GET /api/orders/admin/all
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // PATCH /api/orders/{id}/status  { "status": "SHIPPED" }
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Order.OrderStatus status = Order.OrderStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }
}
