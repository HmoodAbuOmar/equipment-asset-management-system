package com.hmood.equipmentassetmanagement.maintenanceRequest.mapper;

import com.hmood.equipmentassetmanagement.maintenanceRequest.dto.MaintenanceRequestResponse;
import com.hmood.equipmentassetmanagement.maintenanceRequest.model.MaintenanceRequest;
import org.springframework.stereotype.Component;

@Component
public class MaintenanceRequestMapper {

    public MaintenanceRequestResponse toResponse(MaintenanceRequest request) {

        Long itHandlerId = request.getItHandler() != null ? request.getItHandler().getId() : null;

        return new MaintenanceRequestResponse(
                request.getId(),
                request.getAsset().getId(),
                request.getReportedBy().getId(),
                itHandlerId,
                request.getIssueDescription(),
                request.getStatus(),
                request.getRequestDate()
        );
    }
}