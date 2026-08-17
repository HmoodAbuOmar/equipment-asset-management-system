package com.hmood.equipmentassetmanagement.maintenanceRequest.controller;

import com.hmood.equipmentassetmanagement.maintenanceRequest.dto.CreateMaintenanceRequest;
import com.hmood.equipmentassetmanagement.maintenanceRequest.dto.MaintenanceRequestResponse;
import com.hmood.equipmentassetmanagement.maintenanceRequest.dto.ResolveMaintenanceRequest;
import com.hmood.equipmentassetmanagement.maintenanceRequest.service.MaintenanceRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/maintenance-requests")
@RequiredArgsConstructor
public class MaintenanceRequestController {

    private final MaintenanceRequestService maintenanceRequestService;

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MaintenanceRequestResponse createMaintenanceRequest(@Valid @RequestBody CreateMaintenanceRequest request, Authentication authentication) {

        return maintenanceRequestService.createMaintenanceRequest(request, authentication);
    }

    @PreAuthorize("hasRole('IT_SUPPORT')")
    @PutMapping("/{id}/start")
    public MaintenanceRequestResponse startMaintenanceRequest(@PathVariable Long id, Authentication authentication) {

        return maintenanceRequestService.startMaintenanceRequest(id, authentication);
    }

    @PreAuthorize("hasRole('IT_SUPPORT')")
    @PutMapping("/{id}/resolve")
    public MaintenanceRequestResponse resolveMaintenanceRequest(@PathVariable Long id, @RequestBody ResolveMaintenanceRequest request) {

        return maintenanceRequestService.resolveMaintenanceRequest(id, request);
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'IT_SUPPORT')")
    @GetMapping
    public Page<MaintenanceRequestResponse> getMaintenanceRequests(Pageable pageable) {

        return maintenanceRequestService.getMaintenanceRequests(pageable);
    }
}