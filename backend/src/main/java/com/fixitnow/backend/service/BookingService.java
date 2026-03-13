package com.fixitnow.backend.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fixitnow.backend.entity.Booking;
import com.fixitnow.backend.repository.BookingRepository;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    public Booking createBooking(Booking booking) {
        boolean alreadyBooked = bookingRepository.existsByProviderIdAndBookingDateAndTimeSlot(
                booking.getProviderId(),
                booking.getBookingDate(),
                booking.getTimeSlot()
        );

        if (alreadyBooked) {
            throw new RuntimeException("Time slot already booked!");
        }

        booking.setStatus("pending");
        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
    }

    public List<Booking> getBookingsByCustomer(Long customerId) {
        return bookingRepository.findByCustomerId(customerId);
    }

    public List<Booking> getBookingsByProvider(Long providerId) {
        return bookingRepository.findByProviderId(providerId);
    }

    public Booking updateBookingStatus(Long id, String status) {
        Booking booking = getBookingById(id);
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }

    public Booking acceptBooking(Long id) {
        Booking booking = getBookingById(id);
        booking.setStatus("confirmed");
        return bookingRepository.save(booking);
    }

    public Booking rejectBooking(Long id) {
        Booking booking = getBookingById(id);
        booking.setStatus("cancelled");
        return bookingRepository.save(booking);
    }

    public void deleteBooking(Long id) {
        Booking booking = getBookingById(id);
        bookingRepository.delete(booking);
    }
}