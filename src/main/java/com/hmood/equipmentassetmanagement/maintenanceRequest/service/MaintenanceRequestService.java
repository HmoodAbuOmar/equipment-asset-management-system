package com.hmood.equipmentassetmanagement.maintenanceRequest.service;

import com.hmood.equipmentassetmanagement.asset.model.Asset;
import com.hmood.equipmentassetmanagement.asset.repository.AssetRepository;
import com.hmood.equipmentassetmanagement.maintenanceRequest.dto.CreateMaintenanceRequest;
import com.hmood.equipmentassetmanagement.maintenanceRequest.dto.MaintenanceRequestResponse;
import com.hmood.equipmentassetmanagement.maintenanceRequest.dto.ResolveMaintenanceRequest;
import com.hmood.equipmentassetmanagement.maintenanceRequest.mapper.MaintenanceRequestMapper;
import com.hmood.equipmentassetmanagement.maintenanceRequest.model.MaintenanceRequest;
import com.hmood.equipmentassetmanagement.maintenanceRequest.model.MaintenanceStatus;
import com.hmood.equipmentassetmanagement.maintenanceRequest.repository.MaintenanceRequestRepository;
import com.hmood.equipmentassetmanagement.user.model.Role;
import com.hmood.equipmentassetmanagement.user.model.User;
import com.hmood.equipmentassetmanagement.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.Instant;

import com.hmood.equipmentassetmanagement.asset.model.AssetStatus;

@Service
@RequiredArgsConstructor
public class MaintenanceRequestService {

    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final MaintenanceRequestMapper maintenanceRequestMapper;

    @Transactional
    public MaintenanceRequestResponse createMaintenanceRequest(CreateMaintenanceRequest request, Authentication authentication) {

        String email = authentication.getName().trim().toLowerCase();

        User currentUser = userRepository.findByEmailIgnoreCase(email).orElseThrow();

        Asset asset = assetRepository.findById(request.assetId()).orElseThrow();

        if (currentUser.getRole() == Role.EMPLOYEE) {

            if (asset.getCurrentUser() == null || !asset.getCurrentUser().getId().equals(currentUser.getId())) {

                throw new AccessDeniedException("Employee can only report issues for assets assigned to them");
            }
        }

        MaintenanceRequest maintenanceRequest = new MaintenanceRequest();

        maintenanceRequest.setAsset(asset);
        maintenanceRequest.setReportedBy(currentUser);
        maintenanceRequest.setItHandler(null);
        maintenanceRequest.setIssueDescription(request.issueDescription().trim());
        maintenanceRequest.setStatus(MaintenanceStatus.OPEN);
        maintenanceRequest.setRequestDate(Instant.now());

        MaintenanceRequest savedRequest = maintenanceRequestRepository.save(maintenanceRequest);

        return maintenanceRequestMapper.toResponse(savedRequest);
    }

    @Transactional
    public MaintenanceRequestResponse startMaintenanceRequest(Long id, Authentication authentication) {

        String email = authentication.getName().trim().toLowerCase();

        User currentUser = userRepository.findByEmailIgnoreCase(email).orElseThrow();

        MaintenanceRequest maintenanceRequest = maintenanceRequestRepository.findById(id).orElseThrow();

        if (maintenanceRequest.getStatus() != MaintenanceStatus.OPEN) {
            throw new IllegalStateException("Only OPEN maintenance requests can be started");
        }

        maintenanceRequest.setStatus(MaintenanceStatus.IN_PROGRESS);
        maintenanceRequest.setItHandler(currentUser);

        maintenanceRequest.getAsset().setStatus(AssetStatus.UNDER_MAINTENANCE);

        MaintenanceRequest savedRequest = maintenanceRequestRepository.save(maintenanceRequest);

        return maintenanceRequestMapper.toResponse(savedRequest);
    }

    @Transactional
    public MaintenanceRequestResponse resolveMaintenanceRequest(Long id, ResolveMaintenanceRequest request) {

        MaintenanceRequest maintenanceRequest = maintenanceRequestRepository.findById(id).orElseThrow();

        if (maintenanceRequest.getStatus() != MaintenanceStatus.IN_PROGRESS) {
            throw new IllegalStateException("Only IN_PROGRESS maintenance requests can be resolved");
        }

        maintenanceRequest.setStatus(MaintenanceStatus.RESOLVED);

        Asset asset = maintenanceRequest.getAsset();

        if (request.damaged()) {
            asset.setStatus(AssetStatus.DAMAGED);
        } else if (asset.getCurrentUser() != null) {
            asset.setStatus(AssetStatus.ASSIGNED);
        } else {
            asset.setStatus(AssetStatus.AVAILABLE);
        }

        MaintenanceRequest savedRequest = maintenanceRequestRepository.save(maintenanceRequest);

        return maintenanceRequestMapper.toResponse(savedRequest);
    }
    @Transactional
    public Page<MaintenanceRequestResponse> getMaintenanceRequests(Pageable pageable) {

        return maintenanceRequestRepository.findAll(pageable).map(maintenanceRequestMapper::toResponse);
    }
}