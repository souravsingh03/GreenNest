package com.greennest.config;

import com.greennest.model.*;
import com.greennest.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Component @RequiredArgsConstructor @Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository     productRepository;
    private final UserRepository        userRepository;
    private final TestimonialRepository testimonialRepository;
    private final CouponRepository      couponRepository;
    private final PasswordEncoder       passwordEncoder;

    // ── Canonical product data — single source of truth ──────────────────────
    private static final List<Object[]> PRODUCTS = List.of(
            // { name, description, price, category, tags[], imageUrl, stock }
            new Object[]{"Peace Lily",
                    "The Peace Lily is a stunning indoor plant with elegant white flowers and exceptional air-purifying abilities. Perfect for low-light rooms.",
                    "24.99", "INDOOR_PLANT", new String[]{"Indoor","Easy Care","Air Purifier"},
                    "/images/Peace_lily.jpg", 50},
            new Object[]{"Snake Plant",
                    "One of the hardiest plants. Tolerates low light and irregular watering, releases oxygen at night.",
                    "19.99", "INDOOR_PLANT", new String[]{"Indoor","Low Light","Beginner"},
                    "/images/Snake_Plant.jpg", 60},
            new Object[]{"Pothos",
                    "The ultimate beginner plant — nearly indestructible, fast-growing, gorgeous cascading from shelves.",
                    "14.99", "INDOOR_PLANT", new String[]{"Indoor","Fast Growing","Trailing"},
                    "/images/Pothos.jpg", 75},
            new Object[]{"Monstera Deliciosa",
                    "The iconic Swiss Cheese Plant. Dramatic split leaves make it a centrepiece. Loves bright indirect light.",
                    "34.99", "INDOOR_PLANT", new String[]{"Indoor","Statement","Tropical"},
                    "/images/Monstera_Deliciosa.webp", 25},
            new Object[]{"ZZ Plant",
                    "Thrives on neglect. Stores water in rhizomes and tolerates very low light. Perfect for busy people.",
                    "22.99", "INDOOR_PLANT", new String[]{"Indoor","Drought Tolerant","Low Light"},
                    "/images/ZZ_plant.webp", 40},
            new Object[]{"Fiddle Leaf Fig",
                    "Darling of interior designers. Large violin-shaped leaves create instant drama in any bright space.",
                    "44.99", "INDOOR_PLANT", new String[]{"Indoor","Statement","Bright Light"},
                    "/images/Fiddle_Leaf_Fig.webp", 15},
            new Object[]{"Spider Plant",
                    "Cheerful, pet-safe, and incredibly easy to grow. Produces cute spiderettes you can propagate.",
                    "12.99", "INDOOR_PLANT", new String[]{"Indoor","Pet Safe","Hanging"},
                    "/images/Spider_Plant.webp", 80},
            new Object[]{"Chinese Evergreen",
                    "Striking variegated leaves in shades of green, silver, and red. Very tolerant of low light.",
                    "18.99", "INDOOR_PLANT", new String[]{"Indoor","Low Light","Colourful"},
                    "/images/Chinese_Evergreen.jpeg", 35},
            new Object[]{"Lavender",
                    "English Lavender fills the air with intoxicating fragrance all summer long. Garden classic.",
                    "12.99", "OUTDOOR_PLANT", new String[]{"Outdoor","Sunny","Fragrant"},
                    "/images/Lavender.jpg", 40},
            new Object[]{"Rose Bush",
                    "Heritage rose bush producing abundant velvety blooms from spring to autumn. Delightfully fragrant.",
                    "29.99", "OUTDOOR_PLANT", new String[]{"Outdoor","Flowering","Classic"},
                    "/images/Rose_bush.jpg", 30},
            new Object[]{"Fern",
                    "Boston Fern adds lush tropical texture to shady gardens and patios. Loves humidity.",
                    "16.99", "OUTDOOR_PLANT", new String[]{"Outdoor","Shade","Moisture Loving"},
                    "/images/Fern.webp", 45},
            new Object[]{"Marigold",
                    "Garden workhorses — bright blooms deter pests while attracting pollinators all season.",
                    "8.99", "OUTDOOR_PLANT", new String[]{"Outdoor","Sunny","Pest Repelling"},
                    "/images/Marigold.webp", 90},
            new Object[]{"Bougainvillea",
                    "Spectacular waves of colour — perfect for fences, trellises, and garden walls.",
                    "24.99", "OUTDOOR_PLANT", new String[]{"Outdoor","Climbing","Vibrant"},
                    "/images/Bougainvillea.webp", 20},
            new Object[]{"Sunflower Seedlings",
                    "Grow giant sunflowers from premium seedlings. Kids love them, bees adore them.",
                    "6.99", "OUTDOOR_PLANT", new String[]{"Outdoor","Sunny","Edible Seeds"},
                    "/images/Sunflower_Seedlings.jpg", 100},
            new Object[]{"Hibiscus",
                    "Dinner-plate-sized blooms in fiery reds, pinks, and yellows. A showstopper in any garden.",
                    "19.99", "OUTDOOR_PLANT", new String[]{"Outdoor","Tropical","Showy"},
                    "/images/Hibiscus.jpeg", 35},
            new Object[]{"Trowel",
                    "Forged stainless steel trowel with ergonomic rubber grip. Rust-resistant, perfect for planting.",
                    "9.99", "GARDENING_TOOL", new String[]{"Hand Tool","Stainless Steel","Durable"},
                    "/images/trovel.jpg", 100},
            new Object[]{"Pruning Shears",
                    "Professional bypass pruners with razor-sharp blades. Makes clean cuts for healthy plant growth.",
                    "18.99", "GARDENING_TOOL", new String[]{"Precision","Ergonomic","Bypass"},
                    "/images/Pruningtool.jpg", 80},
            new Object[]{"Watering Can",
                    "2-litre copper-finish watering can with long narrow spout — perfect for indoor plants.",
                    "12.99", "GARDENING_TOOL", new String[]{"2L","Eco-Friendly","Indoor/Outdoor"},
                    "/images/Watering_can.avif", 60},
            new Object[]{"Garden Kneeler",
                    "Thick foam kneeler protects your knees. Waterproof, folds flat for easy storage.",
                    "14.99", "GARDENING_TOOL", new String[]{"Comfort","Foam","Foldable"},
                    "/images/Garden_Kneeler.jpg", 50},
            new Object[]{"Plant Mister Bottle",
                    "Elegant amber glass mister bottle. Ideal for tropical plants, terrariums, and air plants.",
                    "11.99", "GARDENING_TOOL", new String[]{"Misting","Fine Spray","Glass"},
                    "/images/Plant_Mister_Bottle.jpg", 75},
            new Object[]{"Soil pH Tester",
                    "3-in-1 tester measures pH, moisture, and light. Solar powered — no batteries needed.",
                    "16.99", "GARDENING_TOOL", new String[]{"Digital","Accurate","No Battery"},
                    "/images/Soil_pH_tester.jpg", 40},
            new Object[]{"Grow Light LED",
                    "Full-spectrum LED grow light with built-in timer. Gives indoor plants the light they need year-round.",
                    "32.99", "GARDENING_TOOL", new String[]{"Full Spectrum","Timer","Energy Saving"},
                    "/images/Grow_Light_LED.jpeg", 30},
            new Object[]{"Compost Bin",
                    "Compact 30L compost bin with odour-sealed lid. Turns kitchen waste into rich garden compost.",
                    "27.99", "GARDENING_TOOL", new String[]{"Eco-Friendly","30L","Kitchen/Garden"},
                    "/images/Compost_Bin.webp", 25}
    );

    @Override
    public void run(String... args) {
        seedOrUpdateProducts();
        seedAdmin();
        seedTestimonials();
        seedCoupons();
    }

    // KEY FIX: always update imageUrl for existing products so DB stays in sync
    private void seedOrUpdateProducts() {
        List<Product> existing = productRepository.findAll();

        if (existing.isEmpty()) {
            // Fresh seed
            List<Product> toSave = new ArrayList<>();
            for (Object[] d : PRODUCTS) toSave.add(build(d));
            productRepository.saveAll(toSave);
            log.info("✅ Seeded {} products", toSave.size());
        } else {
            // Update imageUrl and description for every existing product by name
            int updated = 0;
            for (Object[] d : PRODUCTS) {
                String name     = (String) d[0];
                String imageUrl = (String) d[5];
                String desc     = (String) d[1];
                Optional<Product> match = existing.stream()
                        .filter(p -> p.getName().equalsIgnoreCase(name))
                        .findFirst();
                if (match.isPresent()) {
                    Product p = match.get();
                    boolean changed = false;
                    if (!imageUrl.equals(p.getImageUrl())) {
                        p.setImageUrl(imageUrl);
                        changed = true;
                    }
                    if (!desc.equals(p.getDescription())) {
                        p.setDescription(desc);
                        changed = true;
                    }
                    if (changed) {
                        productRepository.save(p);
                        updated++;
                    }
                } else {
                    // Product doesn't exist yet — insert it
                    productRepository.save(build(d));
                    updated++;
                }
            }
            log.info("✅ Products sync complete — {} updated/added", updated);
        }
    }

    private Product build(Object[] d) {
        return Product.builder()
                .name((String) d[0])
                .description((String) d[1])
                .price(new BigDecimal((String) d[2]))
                .category(Product.Category.valueOf((String) d[3]))
                .tags(Arrays.asList((String[]) d[4]))
                .imageUrl((String) d[5])
                .stock((Integer) d[6])
                .isActive(true)
                .build();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail("admin@greennest.com")) return;
        userRepository.save(User.builder()
                .name("GreenNest Admin").email("admin@greennest.com")
                .password(passwordEncoder.encode("Admin@123")).role(User.Role.ADMIN)
                .build());
        log.info("✅ Admin: admin@greennest.com / Admin@123");
    }

    private void seedTestimonials() {
        if (testimonialRepository.count() > 0) return;
        User j = saveUser("Jane D.",  "jane@example.com");
        User m = saveUser("Mark S.",  "mark@example.com");
        User s = saveUser("Sarah L.", "sarah@example.com");
        testimonialRepository.saveAll(List.of(
                Testimonial.builder().user(j).quote("GreenNest transformed my home with their beautiful plants!").rating(5).isApproved(true).build(),
                Testimonial.builder().user(m).quote("Fast delivery and healthy plants, highly recommend!").rating(5).isApproved(true).build(),
                Testimonial.builder().user(s).quote("Eco-friendly packaging and great customer service!").rating(5).isApproved(true).build()
        ));
        log.info("✅ Seeded 3 testimonials");
    }

    private User saveUser(String name, String email) {
        return userRepository.existsByEmail(email)
                ? userRepository.findByEmail(email).get()
                : userRepository.save(User.builder().name(name).email(email)
                .password(passwordEncoder.encode("pass123")).build());
    }

    private void seedCoupons() {
        if (couponRepository.count() > 0) return;
        couponRepository.saveAll(List.of(
                Coupon.builder().code("WELCOME10")
                        .discountType(Coupon.DiscountType.PERCENTAGE).discountValue(new BigDecimal("10"))
                        .minOrderAmount(new BigDecimal("100")).maxUses(500)
                        .expiresAt(LocalDateTime.now().plusYears(1)).build(),
                Coupon.builder().code("FLAT50")
                        .discountType(Coupon.DiscountType.FLAT).discountValue(new BigDecimal("50"))
                        .minOrderAmount(new BigDecimal("500")).maxUses(200)
                        .expiresAt(LocalDateTime.now().plusMonths(6)).build(),
                Coupon.builder().code("GREENNEST20")
                        .discountType(Coupon.DiscountType.PERCENTAGE).discountValue(new BigDecimal("20"))
                        .minOrderAmount(new BigDecimal("300")).maxUses(100)
                        .expiresAt(LocalDateTime.now().plusMonths(3)).build()
        ));
        log.info("✅ Seeded coupons: WELCOME10 · FLAT50 · GREENNEST20");
    }
}
