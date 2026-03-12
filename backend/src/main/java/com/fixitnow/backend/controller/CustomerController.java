package com.fixitnow.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    @GetMapping("/dashboard")
    public String customerDashboard() {
        return "Welcome Customer!";
    }
}

