package com.fixitnow.backend.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.fixitnow.backend.entity.Review;
import com.fixitnow.backend.dto.ReviewResponseDTO; // 🔥 Import the DTO
import com.fixitnow.backend.service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public Review createReview(@RequestBody Review review) {
        return reviewService.createReview(review);
    }

    // 🔥 Update the return type
    @GetMapping("/provider/{providerId}")
    public List<ReviewResponseDTO> getReviewsByProvider(@PathVariable Long providerId) {
        return reviewService.getReviewsByProvider(providerId);
    }

    // 🔥 Update the return type
    @GetMapping("/booking/{bookingId}")
    public List<ReviewResponseDTO> getReviewsByBooking(@PathVariable Long bookingId) {
        return reviewService.getReviewsByBooking(bookingId);
    }
}