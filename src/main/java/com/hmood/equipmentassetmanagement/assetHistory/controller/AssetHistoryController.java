package com.hmood.equipmentassetmanagement.assetHistory.controller;

import com.hmood.equipmentassetmanagement.assetHistory.dto.AssetHistoryResponse;
import com.hmood.equipmentassetmanagement.assetHistory.service.AssetHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AssetHistoryController {

    private final AssetHistoryService assetHistoryService;

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'IT_SUPPORT')")
    @GetMapping("/assets/{id}/history")
    public List<AssetHistoryResponse> getAssetHistory(@PathVariable Long id) {

        return assetHistoryService.getAssetHistory(id);
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'IT_SUPPORT')")
    @GetMapping("/asset-history")
    public List<AssetHistoryResponse> getAllHistory() {

        return assetHistoryService.getAllHistory();
    }
}