package com.hmood.equipmentassetmanagement.assignment.dto;

import jakarta.validation.constraints.NotNull;

public record CreateAssignmentRequest(

        @NotNull(message = "Asset ID is required")
        Long assetId,

        @NotNull(message = "User ID is required")
        Long userId

) {
}