package com.greennest.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestimonialResponse {

    private Long id;
    private String authorName;
    private String quote;
    private Integer rating;
    private LocalDateTime createdAt;
}
