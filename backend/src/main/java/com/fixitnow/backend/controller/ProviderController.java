package com.fixitnow.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/provider")
public class ProviderController {

    @GetMapping("/dashboard")
    public String providerDashboard() {
        return "Welcome Provider!";
    }
}
