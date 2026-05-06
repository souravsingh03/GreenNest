package com.greennest.service;

import com.greennest.model.*;
import com.greennest.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository   orderRepository;
    private final UserRepository    userRepository;
    private final CartService       cartService;
    private final ProductRepository productRepository;
    private final CouponRepository  couponRepository;

    @Transactional
    public Map<String, Object> checkout(String email, String shippingAddress,
                                        String couponCode, String paymentMethod) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Cart cart = cartService.getCartByUser(user);
        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Your cart is empty");
        }

        Order order = Order.builder()
                .user(user)
                .shippingAddress(shippingAddress)
                .paymentMethod(paymentMethod != null ? paymentMethod : "COD")
                .paymentStatus("COD".equals(paymentMethod) ? "PENDING" : "INITIATED")
                .totalPrice(BigDecimal.ZERO)
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new IllegalStateException(
                        "Insufficient stock for: " + product.getName() +
                        " (Available: " + product.getStock() + ")");
            }
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            BigDecimal lineTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            orderItems.add(OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .priceAtPurchase(product.getPrice())
                    .build());
        }

        order.setSubtotal(subtotal);

        // Apply coupon
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (couponCode != null && !couponCode.isBlank()) {
            Coupon coupon = couponRepository.findByCodeIgnoreCase(couponCode)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Invalid coupon code: " + couponCode));
            if (!coupon.isValid(subtotal)) {
                throw new IllegalStateException(
                        "Coupon '" + couponCode + "' is not applicable on this order.");
            }
            BigDecimal afterDiscount = coupon.apply(subtotal);
            discountAmount = subtotal.subtract(afterDiscount);
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
            order.setCouponCode(couponCode.toUpperCase());
        }

        order.setDiscountAmount(discountAmount);
        order.setTotalPrice(subtotal.subtract(discountAmount));
        order.setItems(orderItems);
        order.setTrackingNumber("GN" + System.currentTimeMillis());

        Order saved = orderRepository.save(order);
        cartService.clearCart(cart);
        return buildOrderResponse(saved);
    }

    public List<Map<String, Object>> getOrderHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::buildOrderResponse).collect(Collectors.toList());
    }

    public Map<String, Object> getOrderById(String email, Long orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied");
        }
        return buildOrderResponse(order);
    }

    @Transactional
    public Map<String, Object> cancelOrder(String email, Long orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied");
        }
        if (order.getStatus() == Order.OrderStatus.SHIPPED ||
                order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot cancel a shipped or delivered order");
        }
        // Restore stock
        order.getItems().forEach(item -> {
            Product p = item.getProduct();
            p.setStock(p.getStock() + item.getQuantity());
            productRepository.save(p);
        });
        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());
        return buildOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public Map<String, Object> updateStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        return buildOrderResponse(orderRepository.save(order));
    }

    public List<Map<String, Object>> getAllOrders() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream().map(this::buildOrderResponse).collect(Collectors.toList());
    }

    private Map<String, Object> buildOrderResponse(Order order) {
        List<Map<String, Object>> items = order.getItems().stream().map(item -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("productId",       item.getProduct().getId());
            m.put("productName",     item.getProduct().getName());
            m.put("imageUrl",        item.getProduct().getImageUrl());
            m.put("category",        item.getProduct().getCategory().name());
            m.put("quantity",        item.getQuantity());
            m.put("priceAtPurchase", item.getPriceAtPurchase());
            m.put("subtotal",        item.getPriceAtPurchase()
                    .multiply(BigDecimal.valueOf(item.getQuantity())));
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("orderId",         order.getId());
        resp.put("items",           items);
        resp.put("subtotal",        order.getSubtotal() != null ? order.getSubtotal() : order.getTotalPrice());
        resp.put("discountAmount",  order.getDiscountAmount());
        resp.put("couponCode",      order.getCouponCode());
        resp.put("totalPrice",      order.getTotalPrice());
        resp.put("status",          order.getStatus().name());
        resp.put("paymentMethod",   order.getPaymentMethod());
        resp.put("paymentStatus",   order.getPaymentStatus());
        resp.put("shippingAddress", order.getShippingAddress());
        resp.put("trackingNumber",  order.getTrackingNumber());
        resp.put("createdAt",       order.getCreatedAt());
        resp.put("updatedAt",       order.getUpdatedAt());
        return resp;
    }
}
