package com.fixitnow.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.fixitnow.backend.entity.Booking;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // 🔥 FIX: Now it checks Provider + Date + Time!
    boolean existsByProviderIdAndBookingDateAndTimeSlotAndStatusIn(
            Long providerId,
            String bookingDate,
            String timeSlot,
            List<String> statuses);

    List<Booking> findByCustomerId(Long customerId);
    List<Booking> findByProviderId(Long providerId);
    long countByProviderIdAndStatus(Long providerId, String status);
}