package com.hmood.equipmentassetmanagement.assetHistory.mapper;

import com.hmood.equipmentassetmanagement.assetHistory.dto.AssetHistoryResponse;
import com.hmood.equipmentassetmanagement.assetHistory.model.AssetHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AssetHistoryMapper {

    @Mapping(source = "asset.id", target = "assetId")
    @Mapping(source = "performedBy.id", target = "performedById")
    @Mapping(source = "performedBy.name", target = "performedByName")
    AssetHistoryResponse toResponse(AssetHistory history);
}