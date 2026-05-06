package com.greennest.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private List<String> tags;
    private String imageUrl;
    private Integer stock;
    private Boolean isActive;
    private Double averageRating;
    private Integer reviewCount;
    private LocalDateTime createdAt;
}
