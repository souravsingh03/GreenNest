package com.greennest.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DiscountType discountType = DiscountType.PERCENTAGE;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue; // e.g. 10 = 10% or ₹10 flat

    @Column(name = "min_order_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(name = "max_uses")
    @Builder.Default
    private Integer maxUses = 100;

    @Column(name = "used_count")
    @Builder.Default
    private Integer usedCount = 0;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    public enum DiscountType {
        PERCENTAGE, FLAT
    }

    public boolean isValid(BigDecimal orderTotal) {
        if (!isActive) return false;
        if (usedCount >= maxUses) return false;
        if (expiresAt != null && LocalDateTime.now().isAfter(expiresAt)) return false;
        if (orderTotal.compareTo(minOrderAmount) < 0) return false;
        return true;
    }

    public BigDecimal apply(BigDecimal orderTotal) {
        if (discountType == DiscountType.PERCENTAGE) {
            BigDecimal discount = orderTotal.multiply(discountValue).divide(BigDecimal.valueOf(100));
            return orderTotal.subtract(discount);
        } else {
            return orderTotal.subtract(discountValue).max(BigDecimal.ZERO);
        }
    }
}
