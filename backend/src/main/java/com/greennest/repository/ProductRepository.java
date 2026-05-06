package com.greennest.repository;

import com.greennest.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Basic category filter
    List<Product> findByCategoryAndIsActiveTrue(Product.Category category);

    // All active products
    List<Product> findByIsActiveTrue();

    // Paginated all active products
    Page<Product> findByIsActiveTrue(Pageable pageable);

    // Paginated by category
    Page<Product> findByCategoryAndIsActiveTrue(Product.Category category, Pageable pageable);

    // Keyword search
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);

    // Advanced filter: category + price range + keyword
    @Query("SELECT p FROM Product p WHERE p.isActive = true " +
           "AND (:category IS NULL OR p.category = :category) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> filterProducts(
            @Param("category") Product.Category category,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("keyword") String keyword,
            Pageable pageable);

    // In-stock products only
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.stock > 0 " +
           "AND (:category IS NULL OR p.category = :category)")
    List<Product> findInStockByCategory(@Param("category") Product.Category category);

    // Low stock alert for admin (stock below threshold)
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.stock <= :threshold")
    List<Product> findLowStockProducts(@Param("threshold") int threshold);

    // Top products by stock (as a proxy for popular ones before we have order data)
    @Query("SELECT p FROM Product p WHERE p.isActive = true ORDER BY p.stock DESC")
    List<Product> findFeaturedProducts(Pageable pageable);
}
