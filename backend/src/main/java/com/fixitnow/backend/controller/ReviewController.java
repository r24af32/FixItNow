package com.fixitnow.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.fixitnow.backend.entity.Review;
import com.fixitnow.backend.service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // Create review
    @PostMapping
    public Review createReview(@RequestBody Review review) {
        return reviewService.createReview(review);
    }

    // Get reviews for provider
    @GetMapping("/provider/{providerId}")
    public List<Review> getReviewsByProvider(@PathVariable Long providerId) {
        return reviewService.getReviewsByProvider(providerId);
    }

    // Get reviews for booking
    @GetMapping("/booking/{bookingId}")
    public List<Review> getReviewsByBooking(@PathVariable Long bookingId) {
        return reviewService.getReviewsByBooking(bookingId);
    }
}