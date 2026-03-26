package com.fixitnow.backend.dto;

public class MonthlyRevenueDTO {
    private String month;
    private double revenue;

    public MonthlyRevenueDTO(String month, double revenue) {
        this.month = month;
        this.revenue = revenue;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public double getRevenue() {
        return revenue;
    }

    public void setRevenue(double revenue) {
        this.revenue = revenue;
    }
}
