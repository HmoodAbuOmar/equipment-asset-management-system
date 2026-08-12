package com.hmood.equipmentassetmanagement.asset.mapper;

import com.hmood.equipmentassetmanagement.asset.dto.AssetResponse;
import com.hmood.equipmentassetmanagement.asset.model.Asset;
import org.springframework.stereotype.Component;

@Component
public class AssetMapper {

    public AssetResponse toResponse(Asset asset) {

        return new AssetResponse(
                asset.getId(),
                asset.getName(),
                asset.getCategory(),
                asset.getSerialNumber(),
                asset.getStatus(),
                asset.getPurchaseDate(),
                asset.getCurrentUser() == null ? null : asset.getCurrentUser().getId()
        );
    }
}