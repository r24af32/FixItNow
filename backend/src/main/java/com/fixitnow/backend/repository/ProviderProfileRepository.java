package com.fixitnow.backend.repository;

import com.fixitnow.backend.entity.ProviderProfile;
import com.fixitnow.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long> {

    Optional<ProviderProfile> findByUser(User user);

    List<ProviderProfile> findByApprovalStatus(String approvalStatus);

}
