package com.fixitnow.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fixitnow.backend.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProviderId(Long providerId);

    List<Review> findByBookingId(Long bookingId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.providerId = :providerId")
    Double getAverageRatingByProviderId(@Param("providerId") Long providerId);

    long countByProviderId(Long providerId);

}