package com.hmood.equipmentassetmanagement.assetHistory.repository;

import com.hmood.equipmentassetmanagement.assetHistory.model.AssetHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetHistoryRepository extends JpaRepository<AssetHistory, Long> {

    List<AssetHistory> findAllByAsset_IdOrderByTimestampDesc(Long assetId);

    List<AssetHistory> findAllByOrderByTimestampDesc();
}

