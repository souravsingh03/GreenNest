package com.greennest.service;

import com.greennest.dto.PagedResponse;
import com.greennest.dto.ProductFilterRequest;
import com.greennest.dto.ProductResponse;
import com.greennest.model.Product;
import com.greennest.repository.ProductRepository;
import com.greennest.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ReviewRepository  reviewRepository;

    // Paginated + filtered — used by /api/products with query params
    public PagedResponse<ProductResponse> getFilteredProducts(ProductFilterRequest req) {
        int page = req.getPage() != null ? req.getPage() : 0;
        int size = req.getSize() != null ? req.getSize() : 9;

        Sort sort = buildSort(req.getSortBy(), req.getSortDir());
        Pageable pageable = PageRequest.of(page, size, sort);

        Product.Category category = null;
        if (req.getCategory() != null && !req.getCategory().isBlank()) {
            try {
                category = Product.Category.valueOf(req.getCategory().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        String keyword = (req.getKeyword() == null || req.getKeyword().isBlank())
                ? null : req.getKeyword();

        Page<Product> result = productRepository.filterProducts(
                category, req.getMinPrice(), req.getMaxPrice(), keyword, pageable);

        List<ProductResponse> content = result.getContent()
                .stream().map(this::toResponse).collect(Collectors.toList());

        return PagedResponse.<ProductResponse>builder()
                .content(content)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .first(result.isFirst())
                .last(result.isLast())
                .build();
    }

    // Simple list — used by /api/products/all (no pagination, for homepage sections)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findByIsActiveTrue()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsByCategory(String category) {
        Product.Category cat = Product.Category.valueOf(category.toUpperCase());
        return productRepository.findByCategoryAndIsActiveTrue(cat)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        return toResponse(product);
    }

    public List<ProductResponse> getFeaturedProducts(int limit) {
        return productRepository.findFeaturedProducts(PageRequest.of(0, limit))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getLowStockProducts(int threshold) {
        return productRepository.findLowStockProducts(threshold)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Admin CRUD
    public ProductResponse createProduct(Product product) {
        return toResponse(productRepository.save(product));
    }

    public ProductResponse updateProduct(Long id, Product updated) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setCategory(updated.getCategory());
        existing.setTags(updated.getTags());
        existing.setImageUrl(updated.getImageUrl());
        existing.setStock(updated.getStock());
        return toResponse(productRepository.save(existing));
    }

    public ProductResponse updateStock(Long id, int newStock) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        product.setStock(newStock);
        return toResponse(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        product.setIsActive(false);
        productRepository.save(product);
    }

    // Helpers
    private Sort buildSort(String sortBy, String sortDir) {
        String field = "createdAt";
        if ("price".equalsIgnoreCase(sortBy)) field = "price";
        if ("name".equalsIgnoreCase(sortBy))  field = "name";
        Sort.Direction dir = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(dir, field);
    }

    public ProductResponse toResponse(Product p) {
        Double avgRating  = reviewRepository.findAverageRatingByProductId(p.getId());
        Long   reviewCount = reviewRepository.countByProductId(p.getId());

        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .category(p.getCategory().name())
                .tags(p.getTags())
                .imageUrl(p.getImageUrl())
                .stock(p.getStock())
                .isActive(p.getIsActive())
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .reviewCount(reviewCount != null ? reviewCount.intValue() : 0)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
