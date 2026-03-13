package com.fixitnow.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.fixitnow.backend.entity.Booking;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByProviderIdAndBookingDateAndTimeSlot(
            Long providerId,
            LocalDate bookingDate,
            String timeSlot
    );

    // Fetch bookings for the Customer Dashboard
    List<Booking> findByCustomerId(Long customerId);

    // Fetch bookings for the Provider Dashboard
    List<Booking> findByProviderId(Long providerId);
}