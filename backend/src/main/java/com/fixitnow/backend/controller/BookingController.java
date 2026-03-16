package com.fixitnow.backend.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fixitnow.backend.dto.BookingCreateRequest;
import com.fixitnow.backend.dto.BookingResponse;
import com.fixitnow.backend.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public BookingResponse createBooking(@RequestBody BookingCreateRequest request, Principal principal) {
        return bookingService.createBooking(request, principal);
    }

    @GetMapping("/customer")
    public List<BookingResponse> getCustomerBookings(Principal principal) {
        return bookingService.getCustomerBookings(principal);
    }

    @PutMapping("/{id}/cancel")
    public BookingResponse cancelBooking(@PathVariable Long id, Principal principal) {
        return bookingService.cancelBooking(id, principal);
    }

    @GetMapping("/provider")
    public List<BookingResponse> getProviderBookings(Principal principal) {
        return bookingService.getProviderBookings(principal);
    }

    @PutMapping("/{id}/accept")
    public BookingResponse acceptBooking(@PathVariable Long id, Principal principal) {
        return bookingService.acceptBooking(id, principal);
    }

    @PutMapping("/{id}/reject")
    public BookingResponse rejectBooking(@PathVariable Long id, Principal principal) {
        return bookingService.rejectBooking(id, principal);
    }

    @PutMapping("/{id}/complete")
    public BookingResponse completeBooking(@PathVariable Long id, Principal principal) {
        return bookingService.completeBooking(id, principal);
    }
}