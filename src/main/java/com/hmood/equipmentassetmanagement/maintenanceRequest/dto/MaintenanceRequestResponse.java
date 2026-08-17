package com.hmood.equipmentassetmanagement.maintenanceRequest.dto;

import com.hmood.equipmentassetmanagement.maintenanceRequest.model.MaintenanceStatus;

import java.time.Instant;

public record MaintenanceRequestResponse(
        Long id,
        Long assetId,
        Long reportedById,
        Long itHandlerId,
        String issueDescription,
        MaintenanceStatus status,
        Instant requestDate
) {
}