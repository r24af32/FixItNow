package com.fixitnow.backend.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.fixitnow.backend.entity.Booking;
import com.fixitnow.backend.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping("/create")
    public Booking createBooking(@RequestBody Booking booking){
        return bookingService.createBooking(booking);
    }

    @GetMapping("/all")
    public List<Booking> getAllBookings(){
        return bookingService.getAllBookings();
    }

    @GetMapping("/{id}")
    public Booking getBookingById(@PathVariable Long id){
        return bookingService.getBookingById(id);
    }

    @GetMapping("/customer/{customerId}")
    public List<Booking> getCustomerBookings(@PathVariable Long customerId) {
        return bookingService.getBookingsByCustomer(customerId);
    }

    @GetMapping("/provider/{providerId}")
    public List<Booking> getProviderBookings(@PathVariable Long providerId) {
        return bookingService.getBookingsByProvider(providerId);
    }

    @PutMapping("/update/{id}")
    public Booking updateBookingStatus(
            @PathVariable Long id,
            @RequestParam String status){
        return bookingService.updateBookingStatus(id, status);
    }

    @PutMapping("/accept/{id}")
    public Booking acceptBooking(@PathVariable Long id){
        return bookingService.acceptBooking(id);
    }

    @PutMapping("/reject/{id}")
    public Booking rejectBooking(@PathVariable Long id){
        return bookingService.rejectBooking(id);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteBooking(@PathVariable Long id){
        bookingService.deleteBooking(id);
        return "Booking deleted successfully";
    }
}