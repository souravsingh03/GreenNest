package com.greennest.service;

import com.greennest.model.Order;
import com.greennest.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository    userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository   orderRepository;
    private final ReviewRepository  reviewRepository;

    public Map<String, Object> getDashboardStats() {
        List<Order> allOrders = orderRepository.findAll();

        long totalUsers    = userRepository.count();
        long totalProducts = productRepository.findByIsActiveTrue().size();
        long totalOrders   = allOrders.size();

        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() != Order.OrderStatus.CANCELLED)
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> ordersByStatus = allOrders.stream()
                .collect(Collectors.groupingBy(o -> o.getStatus().name(), Collectors.counting()));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long todayOrders = allOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(startOfDay)).count();

        BigDecimal todayRevenue = allOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(startOfDay)
                        && o.getStatus() != Order.OrderStatus.CANCELLED)
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Map<String, Object>> lowStock = productRepository.findLowStockProducts(10)
                .stream().map(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",       p.getId());
                    m.put("name",     p.getName());
                    m.put("stock",    p.getStock());
                    m.put("category", p.getCategory().name());
                    return m;
                }).collect(Collectors.toList());

        List<Map<String, Object>> recentOrders = allOrders.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(o -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("orderId",   o.getId());
                    m.put("customer",  o.getUser().getName());
                    m.put("total",     o.getTotalPrice());
                    m.put("status",    o.getStatus().name());
                    m.put("createdAt", o.getCreatedAt());
                    return m;
                }).collect(Collectors.toList());

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers",     totalUsers);
        stats.put("totalProducts",  totalProducts);
        stats.put("totalOrders",    totalOrders);
        stats.put("totalRevenue",   totalRevenue);
        stats.put("todayOrders",    todayOrders);
        stats.put("todayRevenue",   todayRevenue);
        stats.put("ordersByStatus", ordersByStatus);
        stats.put("lowStockAlerts", lowStock);
        stats.put("recentOrders",   recentOrders);
        return stats;
    }

    public List<Map<String, Object>> getMonthlyRevenue() {
        return orderRepository.findAll().stream()
                .filter(o -> o.getStatus() != Order.OrderStatus.CANCELLED)
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().getYear() + "-" +
                             String.format("%02d", o.getCreatedAt().getMonthValue()),
                        Collectors.reducing(BigDecimal.ZERO, Order::getTotalPrice, BigDecimal::add)))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("month",   e.getKey());
                    m.put("revenue", e.getValue());
                    return m;
                }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",        u.getId());
            m.put("name",      u.getName());
            m.put("email",     u.getEmail());
            m.put("role",      u.getRole().name());
            m.put("createdAt", u.getCreatedAt());
            return m;
        }).collect(Collectors.toList());
    }
}
