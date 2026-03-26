package com.fixitnow.backend.dto;

public class MonthlyBookingTrendDTO {
    private String month;
    private long bookings;

    public MonthlyBookingTrendDTO(String month, long bookings) {
        this.month = month;
        this.bookings = bookings;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public long getBookings() {
        return bookings;
    }

    public void setBookings(long bookings) {
        this.bookings = bookings;
    }
}
