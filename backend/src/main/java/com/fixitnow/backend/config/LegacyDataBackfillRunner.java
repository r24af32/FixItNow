package com.fixitnow.backend.config;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.fixitnow.backend.entity.ProviderProfile;
import com.fixitnow.backend.entity.ServiceEntity;
import com.fixitnow.backend.entity.User;
import com.fixitnow.backend.repository.ProviderProfileRepository;
import com.fixitnow.backend.repository.ServiceRepository;
import com.fixitnow.backend.repository.UserRepository;

@Component
public class LegacyDataBackfillRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final ProviderProfileRepository providerProfileRepository;

    public LegacyDataBackfillRunner(UserRepository userRepository,
                                    ServiceRepository serviceRepository,
                                    ProviderProfileRepository providerProfileRepository) {
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
        this.providerProfileRepository = providerProfileRepository;
    }

    @Override
    public void run(String... args) {
        backfillUsers();
        backfillServices();
        backfillProviderProfiles();
    }

    private void backfillUsers() {
        List<User> users = userRepository.findAll();
        boolean dirty = false;

        for (User user : users) {
            if (user.getCreatedAt() == null) {
                user.setCreatedAt(LocalDateTime.now());
                dirty = true;
            }
            if (user.getActive() == null) {
                user.setActive(true);
                dirty = true;
            }
        }

        if (dirty) {
            userRepository.saveAll(users);
        }
    }

    private void backfillServices() {
        List<ServiceEntity> services = serviceRepository.findAll();
        boolean dirty = false;

        for (ServiceEntity service : services) {
            if (service.getCreatedAt() == null) {
                service.setCreatedAt(LocalDateTime.now());
                dirty = true;
            }
            if (service.getAvailability() == null || service.getAvailability().isBlank()) {
                service.setAvailability("all");
                dirty = true;
            }
        }

        if (dirty) {
            serviceRepository.saveAll(services);
        }
    }

    private void backfillProviderProfiles() {
        List<ProviderProfile> profiles = providerProfileRepository.findAll();
        boolean dirty = false;

        for (ProviderProfile profile : profiles) {
            if (profile.getApprovalStatus() == null || profile.getApprovalStatus().isBlank()) {
                profile.setApprovalStatus("PENDING");
                dirty = true;
            }
        }

        if (dirty) {
            providerProfileRepository.saveAll(profiles);
        }
    }
}
