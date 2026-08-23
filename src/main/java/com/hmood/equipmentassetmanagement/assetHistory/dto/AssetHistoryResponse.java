package com.hmood.equipmentassetmanagement.assetHistory.dto;

import com.hmood.equipmentassetmanagement.assetHistory.model.AssetHistoryActionType;

import java.time.Instant;

public record AssetHistoryResponse(
        Long id,
        Long assetId,
        Long performedById,
        String performedByName,
        AssetHistoryActionType actionType,
        Instant timestamp,
        String notes
) {
}