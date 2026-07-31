package com.hmood.equipmentassetmanagement.asset.service;

import com.hmood.equipmentassetmanagement.asset.dto.AssetResponse;
import com.hmood.equipmentassetmanagement.asset.dto.CreateAssetRequest;
import com.hmood.equipmentassetmanagement.asset.dto.UpdateAssetRequest;
import com.hmood.equipmentassetmanagement.asset.exception.AssetDeletionNotAllowedException;
import com.hmood.equipmentassetmanagement.asset.exception.AssetNotFoundException;
import com.hmood.equipmentassetmanagement.asset.exception.SerialNumberAlreadyExistsException;
import com.hmood.equipmentassetmanagement.asset.model.Asset;
import com.hmood.equipmentassetmanagement.asset.model.AssetStatus;
import com.hmood.equipmentassetmanagement.asset.repository.AssetRepository;
import com.hmood.equipmentassetmanagement.asset.specification.AssetSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;  // == public AssetService(AssetRepository assetRepository) {this.assetRepository = assetRepository} // Lombok generates the constructor because of @RequiredArgsConstructor


    @Transactional
    public AssetResponse createAsset(CreateAssetRequest request) {

        String normalizedSerialNumber = request.serialNumber().trim().toUpperCase(Locale.ROOT);

        if (assetRepository.existsBySerialNumberIgnoreCase(normalizedSerialNumber)) {
            throw new SerialNumberAlreadyExistsException("Serial number already exists");
        }

        Asset asset = new Asset();
        asset.setName(request.name().trim());
        asset.setCategory(request.category().trim());
        asset.setSerialNumber(normalizedSerialNumber);
        asset.setPurchaseDate(request.purchaseDate());

        Asset savedAsset = assetRepository.save(asset);

        return toResponse(savedAsset);
    }

    @Transactional(readOnly = true)
    public AssetResponse getAssetById(Long id) {

        Optional<Asset> optionalAsset = assetRepository.findById(id);

        if (optionalAsset.isEmpty()) {
            throw new AssetNotFoundException(id);
        }

        Asset asset = optionalAsset.get();

        //  by. Lambda :
        // Asset asset = assetRepository.findById(id)
        //         .orElseThrow(() -> new AssetNotFoundException(id));

        return toResponse(asset);
    }

    @Transactional(readOnly = true)
    public Page<AssetResponse> getAssets(String search, AssetStatus status, String category, Pageable pageable) {

        Specification<Asset> specification = AssetSpecifications.withFilters(search, status, category);

        Page<Asset> assetPage = assetRepository.findAll(specification, pageable);

        return assetPage.map(this::toResponse);
    }

    @Transactional
    public AssetResponse updateAsset(Long id, UpdateAssetRequest request) {

        Optional<Asset> optionalAsset = assetRepository.findById(id);

        if (optionalAsset.isEmpty()) {
            throw new AssetNotFoundException(id);
        }

        Asset asset = optionalAsset.get();

        asset.setName(request.name().trim());
        asset.setCategory(request.category().trim());
        asset.setPurchaseDate(request.purchaseDate());

        Asset updatedAsset = assetRepository.save(asset);

        return toResponse(updatedAsset);
    }

    @Transactional
    public void deleteAsset(Long id) {

        Optional<Asset> optionalAsset = assetRepository.findById(id);

        if (optionalAsset.isEmpty()) {
            throw new AssetNotFoundException(id);
        }

        Asset asset = optionalAsset.get();

        if (asset.getStatus() == AssetStatus.ASSIGNED) {
            throw new AssetDeletionNotAllowedException(
                    "Assigned asset cannot be deleted"
            );
        }

        if (asset.getStatus() == AssetStatus.UNDER_MAINTENANCE) {
            throw new AssetDeletionNotAllowedException(
                    "Asset under maintenance cannot be deleted"
            );
        }

        assetRepository.delete(asset);
    }

    private AssetResponse toResponse(Asset asset) {
        return new AssetResponse(asset.getId(), asset.getName(), asset.getCategory(), asset.getSerialNumber(), asset.getStatus(), asset.getPurchaseDate(), asset.getCurrentUser() == null ? null : asset.getCurrentUser().getId());
    }
}