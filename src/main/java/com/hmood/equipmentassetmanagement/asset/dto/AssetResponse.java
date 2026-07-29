    package com.hmood.equipmentassetmanagement.asset.dto;

    import com.hmood.equipmentassetmanagement.asset.model.AssetStatus;

    import java.time.LocalDate;

    public record AssetResponse(
            Long id,
            String name,
            String category,
            String serialNumber,
            AssetStatus status,
            LocalDate purchaseDate,
            Long currentUserId
    ) {
    }