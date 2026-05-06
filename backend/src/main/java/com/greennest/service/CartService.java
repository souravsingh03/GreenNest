package com.greennest.service;

import com.greennest.model.*;
import com.greennest.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // ── Get Cart ─────────────────────────────────────────────────────────────

    public Map<String, Object> getCart(String email) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);
        return buildCartResponse(cart);
    }

    // ── Add Item ─────────────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> addItem(String email, Long productId, int quantity) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));

        if (!product.getIsActive()) {
            throw new IllegalArgumentException("Product is no longer available: " + product.getName());
        }

        if (product.getStock() < quantity) {
            throw new IllegalStateException(
                    "Only " + product.getStock() + " units available for: " + product.getName());
        }

        // If already in cart, increase quantity
        Optional<CartItem> existing = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existing.isPresent()) {
            int newQty = existing.get().getQuantity() + quantity;
            if (newQty > product.getStock()) {
                throw new IllegalStateException(
                        "Cannot add " + quantity + " more. Only " + product.getStock() + " in stock.");
            }
            existing.get().setQuantity(newQty);
        } else {
            cart.getItems().add(
                    CartItem.builder().cart(cart).product(product).quantity(quantity).build());
        }

        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
        return buildCartResponse(cart);
    }

    // ── Update Quantity ───────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> updateItem(String email, Long cartItemId, int quantity) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found: " + cartItemId));

        if (quantity > item.getProduct().getStock()) {
            throw new IllegalStateException(
                    "Only " + item.getProduct().getStock() + " units available.");
        }

        item.setQuantity(quantity);
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
        return buildCartResponse(cart);
    }

    // ── Remove Item ──────────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> removeItem(String email, Long cartItemId) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);
        boolean removed = cart.getItems().removeIf(item -> item.getId().equals(cartItemId));
        if (!removed) throw new IllegalArgumentException("Cart item not found: " + cartItemId);
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
        return buildCartResponse(cart);
    }

    // ── Clear Cart ────────────────────────────────────────────────────────────

    @Transactional
    public void clearCart(Cart cart) {
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    // ── Cart Summary (for checkout preview) ──────────────────────────────────

    public Map<String, Object> getCartSummary(String email) {
        User user = getUser(email);
        Cart cart = getOrCreateCart(user);
        return buildCartResponse(cart);
    }

    public Cart getCartByUser(User user) {
        return getOrCreateCart(user);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().user(user).build();
                    return cartRepository.save(newCart);
                });
    }

    private Map<String, Object> buildCartResponse(Cart cart) {
        List<Map<String, Object>> items = cart.getItems().stream().map(item -> {
            Product p = item.getProduct();
            BigDecimal subtotal = p.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("cartItemId",   item.getId());
            m.put("productId",    p.getId());
            m.put("productName",  p.getName());
            m.put("imageUrl",     p.getImageUrl());
            m.put("category",     p.getCategory().name());
            m.put("unitPrice",    p.getPrice());
            m.put("quantity",     item.getQuantity());
            m.put("subtotal",     subtotal);
            m.put("stockLeft",    p.getStock());
            m.put("available",    p.getIsActive() && p.getStock() > 0);
            return m;
        }).collect(Collectors.toList());

        BigDecimal total = cart.getItems().stream()
                .map(i -> i.getProduct().getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = cart.getItems().stream().mapToInt(CartItem::getQuantity).sum();

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("cartId",      cart.getId());
        resp.put("items",       items);
        resp.put("totalItems",  totalItems);
        resp.put("totalPrice",  total);
        resp.put("isEmpty",     items.isEmpty());
        return resp;
    }
}
