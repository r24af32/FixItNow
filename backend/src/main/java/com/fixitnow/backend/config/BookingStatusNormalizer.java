package com.fixitnow.backend.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.fixitnow.backend.entity.Booking;
import com.fixitnow.backend.repository.BookingRepository;

@Component
public class BookingStatusNormalizer implements CommandLineRunner {

    private final BookingRepository bookingRepository;

    public BookingStatusNormalizer(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Override
    public void run(String... args) {
        List<Booking> changed = new ArrayList<>();

        for (Booking booking : bookingRepository.findAll()) {
            String status = booking.getStatus();
            if (status == null) {
                continue;
            }

            String normalized = status.toUpperCase();
            if (!normalized.equals(status)) {
                booking.setStatus(normalized);
                changed.add(booking);
            }
        }

        if (!changed.isEmpty()) {
            bookingRepository.saveAll(changed);
        }
    }
}
