package com.hmood.equipmentassetmanagement.assetHistory.service;

import com.hmood.equipmentassetmanagement.asset.exception.AssetNotFoundException;
import com.hmood.equipmentassetmanagement.asset.model.Asset;
import com.hmood.equipmentassetmanagement.asset.repository.AssetRepository;
import com.hmood.equipmentassetmanagement.assetHistory.dto.AssetHistoryResponse;
import com.hmood.equipmentassetmanagement.assetHistory.mapper.AssetHistoryMapper;
import com.hmood.equipmentassetmanagement.assetHistory.model.AssetHistory;
import com.hmood.equipmentassetmanagement.assetHistory.model.AssetHistoryActionType;
import com.hmood.equipmentassetmanagement.assetHistory.repository.AssetHistoryRepository;
import com.hmood.equipmentassetmanagement.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetHistoryService {

    private final AssetHistoryRepository assetHistoryRepository;
    private final AssetHistoryMapper assetHistoryMapper;
    private final AssetRepository assetRepository;

    public void log(Asset asset, User performedBy, AssetHistoryActionType actionType, String notes) {

        AssetHistory history = new AssetHistory();

        history.setAsset(asset);
        history.setPerformedBy(performedBy);
        history.setActionType(actionType);
        history.setTimestamp(Instant.now());
        history.setNotes(notes);

        assetHistoryRepository.save(history);
    }

    @Transactional(readOnly = true)
    public List<AssetHistoryResponse> getAssetHistory(Long assetId) {

        if (!assetRepository.existsById(assetId)) {
            throw new AssetNotFoundException(assetId);
        }

        return assetHistoryRepository.findAllByAsset_IdOrderByTimestampDesc(assetId).stream().map(assetHistoryMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AssetHistoryResponse> getAllHistory() {

        return assetHistoryRepository
                .findAllByOrderByTimestampDesc()
                .stream()
                .map(assetHistoryMapper::toResponse)
                .toList();
    }
}