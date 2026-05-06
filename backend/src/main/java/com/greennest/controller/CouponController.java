package com.greennest.controller;

import com.greennest.dto.CouponValidateRequest;
import com.greennest.model.Coupon;
import com.greennest.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    // POST /api/coupons/validate  { "code": "SAVE10", "orderTotal": 599.00 }
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validate(
            @Valid @RequestBody CouponValidateRequest req) {
        return ResponseEntity.ok(couponService.validateCoupon(req.getCode(), req.getOrderTotal()));
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    // GET /api/coupons/admin
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    // POST /api/coupons/admin
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponService.createCoupon(coupon));
    }

    // PATCH /api/coupons/admin/{id}/toggle
    @PatchMapping("/admin/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> toggleCoupon(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.toggleCoupon(id));
    }
}
