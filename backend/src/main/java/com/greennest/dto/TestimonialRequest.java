package com.greennest.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestimonialRequest {

    @NotBlank(message = "Quote is required")
    @Size(max = 500, message = "Quote must be under 500 characters")
    private String quote;

    @Min(1)
    @Max(5)
    private Integer rating = 5;
}
