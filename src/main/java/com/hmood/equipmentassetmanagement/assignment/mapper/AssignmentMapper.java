package com.hmood.equipmentassetmanagement.assignment.mapper;

import com.hmood.equipmentassetmanagement.assignment.dto.AssignmentResponse;
import com.hmood.equipmentassetmanagement.assignment.model.Assignment;
import org.springframework.stereotype.Component;

@Component
public class AssignmentMapper {

    public AssignmentResponse toResponse(Assignment assignment) {
        return new AssignmentResponse(
                assignment.getId(),
                assignment.getAsset().getId(),
                assignment.getAsset().getName(),
                assignment.getUser().getId(),
                assignment.getUser().getName(),
                assignment.getAssignedAt(),
                assignment.getReturnedAt()
        );
    }
}