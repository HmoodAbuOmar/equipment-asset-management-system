package com.hmood.equipmentassetmanagement.assignment.dto;

import java.time.Instant;

public record AssignmentResponse(
        Long id,
        Long assetId,
        String assetName,
        Long userId,
        String userName,
        Instant assignedAt,
        Instant returnedAt
) {
}