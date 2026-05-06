package com.greennest.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String couponCode;      // optional

    private String paymentMethod = "COD"; // COD, RAZORPAY, UPI
}
