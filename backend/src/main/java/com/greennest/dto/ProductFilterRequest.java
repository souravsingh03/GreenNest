package com.greennest.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductFilterRequest {
    private String category;       // INDOOR_PLANT, OUTDOOR_PLANT, GARDENING_TOOL
    private String keyword;        // search term
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String sortBy;         // price, name, newest
    private String sortDir;        // asc, desc
    private Integer page;
    private Integer size;
    private Boolean inStockOnly;
}
