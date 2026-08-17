package com.hmood.equipmentassetmanagement.maintenanceRequest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateMaintenanceRequest(
        @NotNull
        Long assetId,
        @NotBlank String
        issueDescription
) {
}