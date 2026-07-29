package com.hmood.equipmentassetmanagement.asset.repository;

import com.hmood.equipmentassetmanagement.asset.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {

    boolean existsBySerialNumberIgnoreCase(String serialNumber);
}