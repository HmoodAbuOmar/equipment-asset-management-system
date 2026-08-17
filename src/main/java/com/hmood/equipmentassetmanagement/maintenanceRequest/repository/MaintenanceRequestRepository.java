package com.hmood.equipmentassetmanagement.maintenanceRequest.repository;

import com.hmood.equipmentassetmanagement.maintenanceRequest.model.MaintenanceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    @Override
    @EntityGraph(attributePaths = {"asset", "reportedBy", "itHandler"})
    Page<MaintenanceRequest> findAll(Pageable pageable);
}