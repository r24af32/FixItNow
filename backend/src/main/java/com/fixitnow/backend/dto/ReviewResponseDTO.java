package com.fixitnow.backend.dto;

import com.fixitnow.backend.entity.Review;
import lombok.Data;
import java.time.LocalDateTime;

@Data // If you don't use Lombok, just generate standard Getters & Setters
public class ReviewResponseDTO {
    private Long id;
    private Long bookingId;
    private Long customerId;
    private String customerName; // 🔥 The missing piece!
    private Long providerId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public ReviewResponseDTO(Review review, String customerName) {
        this.id = review.getId();
        this.bookingId = review.getBookingId();
        this.customerId = review.getCustomerId();
        this.providerId = review.getProviderId();
        this.rating = review.getRating();
        this.comment = review.getComment();
        this.createdAt = review.getCreatedAt();
        this.customerName = customerName; // Assign the name!
    }
}