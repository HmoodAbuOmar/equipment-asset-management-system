package com.hmood.equipmentassetmanagement.asset.controller;

import com.hmood.equipmentassetmanagement.asset.dto.AssetResponse;
import com.hmood.equipmentassetmanagement.asset.dto.CreateAssetRequest;
import com.hmood.equipmentassetmanagement.asset.dto.UpdateAssetRequest;
import com.hmood.equipmentassetmanagement.asset.model.AssetStatus;
import com.hmood.equipmentassetmanagement.asset.service.AssetService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor // generates a constructor for final fields
public class AssetController {

    private final AssetService assetService;

    @PostMapping
    public ResponseEntity<AssetResponse> createAsset(@Valid @RequestBody CreateAssetRequest request) {

        AssetResponse response = assetService.createAsset(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<PagedModel<AssetResponse>> getAssets(@RequestParam(required = false) String search, @RequestParam(required = false) AssetStatus status, @RequestParam(required = false) String category,

                                                               @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page must be 0 or greater") int page,

                                                               @RequestParam(defaultValue = "20") @Min(value = 1, message = "Size must be at least 1") @Max(value = 100, message = "Size must not exceed 100") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Page<AssetResponse> assetPage = assetService.getAssets(search, status, category, pageable);

        PagedModel<AssetResponse> response = new PagedModel<>(assetPage);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetResponse> getAssetById(@PathVariable Long id) {

        AssetResponse assetResponse = assetService.getAssetById(id);

        return ResponseEntity.ok(assetResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssetResponse> updateAsset(@PathVariable Long id, @Valid @RequestBody UpdateAssetRequest request) {

        AssetResponse assetResponse = assetService.updateAsset(id, request);

        return ResponseEntity.ok(assetResponse);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {

        assetService.deleteAsset(id);

        return ResponseEntity.noContent().build();
    }
}