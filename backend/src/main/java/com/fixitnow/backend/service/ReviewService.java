package com.fixitnow.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fixitnow.backend.dto.ReviewResponseDTO;
import com.fixitnow.backend.entity.Review;
import com.fixitnow.backend.entity.User;
import com.fixitnow.backend.repository.ReviewRepository;
import com.fixitnow.backend.repository.UserRepository;

@Service
@SuppressWarnings("null")
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository; //  Inject this to find the names!

    public Review createReview(Review review) {
        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }
        return reviewRepository.save(review);
    }

    // 🔥 Update this to return DTOs with the Customer Name
    public List<ReviewResponseDTO> getReviewsByProvider(Long providerId) {
        List<Review> reviews = reviewRepository.findByProviderId(providerId);
        
        return reviews.stream().map(review -> {
            // Find the user to get their name, or default to "Anonymous" if deleted
            String customerName = "Anonymous";
            if (review.getCustomerId() != null) {
                User customer = userRepository.findById(review.getCustomerId()).orElse(null);
                if (customer != null) {
                    customerName = customer.getName();
                }
            }
            return new ReviewResponseDTO(review, customerName);
        }).collect(Collectors.toList());
    }

    // Optional: Do the same for getReviewsByBooking if needed
    public List<ReviewResponseDTO> getReviewsByBooking(Long bookingId) {
        List<Review> reviews = reviewRepository.findByBookingId(bookingId);
        return reviews.stream().map(review -> {
            String customerName = "Anonymous";
            if (review.getCustomerId() != null) {
                User customer = userRepository.findById(review.getCustomerId()).orElse(null);
                if (customer != null) {
                    customerName = customer.getName();
                }
            }
            return new ReviewResponseDTO(review, customerName);
        }).collect(Collectors.toList());
    }
}