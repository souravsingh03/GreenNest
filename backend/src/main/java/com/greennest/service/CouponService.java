package com.greennest.service;

import com.greennest.model.Coupon;
import com.greennest.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    // Validate coupon and return discount info (does NOT consume it)
    public Map<String, Object> validateCoupon(String code, BigDecimal orderTotal) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new IllegalArgumentException("Coupon '" + code + "' does not exist"));

        if (!coupon.isValid(orderTotal)) {
            String reason = "Coupon is not valid";
            if (!coupon.getIsActive()) reason = "This coupon has been deactivated";
            else if (coupon.getUsedCount() >= coupon.getMaxUses()) reason = "Coupon usage limit reached";
            else if (coupon.getExpiresAt() != null &&
                     java.time.LocalDateTime.now().isAfter(coupon.getExpiresAt()))
                reason = "Coupon has expired";
            else if (orderTotal.compareTo(coupon.getMinOrderAmount()) < 0)
                reason = "Minimum order amount is ₹" + coupon.getMinOrderAmount() + " for this coupon";
            throw new IllegalStateException(reason);
        }

        BigDecimal discounted = coupon.apply(orderTotal);
        BigDecimal savings    = orderTotal.subtract(discounted);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("code",           coupon.getCode());
        resp.put("discountType",   coupon.getDiscountType().name());
        resp.put("discountValue",  coupon.getDiscountValue());
        resp.put("originalTotal",  orderTotal);
        resp.put("discountAmount", savings);
        resp.put("finalTotal",     discounted);
        resp.put("message",        "Coupon applied! You save ₹" + savings);
        return resp;
    }

    // Admin: create coupon
    @Transactional
    public Map<String, Object> createCoupon(Coupon coupon) {
        if (couponRepository.existsByCodeIgnoreCase(coupon.getCode())) {
            throw new IllegalArgumentException("Coupon code already exists: " + coupon.getCode());
        }
        coupon.setCode(coupon.getCode().toUpperCase());
        Coupon saved = couponRepository.save(coupon);
        return toCouponMap(saved);
    }

    // Admin: list all coupons
    public List<Map<String, Object>> getAllCoupons() {
        return couponRepository.findAll().stream().map(this::toCouponMap).toList();
    }

    // Admin: toggle active
    @Transactional
    public Map<String, Object> toggleCoupon(Long id) {
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found: " + id));
        c.setIsActive(!c.getIsActive());
        return toCouponMap(couponRepository.save(c));
    }

    private Map<String, Object> toCouponMap(Coupon c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",             c.getId());
        m.put("code",           c.getCode());
        m.put("discountType",   c.getDiscountType().name());
        m.put("discountValue",  c.getDiscountValue());
        m.put("minOrderAmount", c.getMinOrderAmount());
        m.put("maxUses",        c.getMaxUses());
        m.put("usedCount",      c.getUsedCount());
        m.put("expiresAt",      c.getExpiresAt());
        m.put("isActive",       c.getIsActive());
        return m;
    }
}
