package com.hmood.equipmentassetmanagement.assignment.service;

import com.hmood.equipmentassetmanagement.asset.exception.AssetNotFoundException;
import com.hmood.equipmentassetmanagement.asset.model.Asset;
import com.hmood.equipmentassetmanagement.asset.model.AssetStatus;
import com.hmood.equipmentassetmanagement.asset.repository.AssetRepository;
import com.hmood.equipmentassetmanagement.assignment.dto.AssignmentResponse;
import com.hmood.equipmentassetmanagement.assignment.dto.CreateAssignmentRequest;
import com.hmood.equipmentassetmanagement.assignment.exception.AssignmentNotAllowedException;
import com.hmood.equipmentassetmanagement.assignment.exception.AssignmentNotFoundException;
import com.hmood.equipmentassetmanagement.assignment.mapper.AssignmentMapper;
import com.hmood.equipmentassetmanagement.assignment.model.Assignment;
import com.hmood.equipmentassetmanagement.assignment.repository.AssignmentRepository;
import com.hmood.equipmentassetmanagement.user.exception.UserNotFoundException;
import com.hmood.equipmentassetmanagement.user.model.Role;
import com.hmood.equipmentassetmanagement.user.model.User;
import com.hmood.equipmentassetmanagement.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import com.hmood.equipmentassetmanagement.asset.dto.AssetResponse;
import com.hmood.equipmentassetmanagement.asset.mapper.AssetMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final AssignmentMapper assignmentMapper;
    private final AssetMapper assetMapper;

    @Transactional
    public AssignmentResponse createAssignment(CreateAssignmentRequest request) {

        Asset asset = assetRepository.findById(request.assetId()).orElseThrow(() -> new AssetNotFoundException(request.assetId()));

        User user = userRepository.findById(request.userId()).orElseThrow(() -> new UserNotFoundException(request.userId()));

        if (user.getRole() != Role.EMPLOYEE) {
            throw new AssignmentNotAllowedException("Assets can only be assigned to employees");
        }

        if (asset.getStatus() != AssetStatus.AVAILABLE) {
            throw new AssignmentNotAllowedException("Asset is not available for assignment");
        }

        boolean hasActiveAssignment = assignmentRepository.existsByAsset_IdAndReturnedAtIsNull(asset.getId());

        if (hasActiveAssignment) {
            throw new AssignmentNotAllowedException("Asset already has an active assignment");
        }

        Assignment assignment = new Assignment();

        assignment.setAsset(asset);
        assignment.setUser(user);
        assignment.setAssignedAt(Instant.now());

        asset.setStatus(AssetStatus.ASSIGNED);
        asset.setCurrentUser(user);

        Assignment savedAssignment = assignmentRepository.saveAndFlush(assignment);

        return assignmentMapper.toResponse(savedAssignment);
    }

    @Transactional
    public AssignmentResponse returnAssignment(Long id) {

        Assignment assignment = assignmentRepository.findByIdAndReturnedAtIsNull(id).orElseThrow(() -> new AssignmentNotFoundException(id));

        Asset asset = assignment.getAsset();

        assignment.setReturnedAt(Instant.now());

        asset.setStatus(AssetStatus.AVAILABLE);
        asset.setCurrentUser(null);

        Assignment savedAssignment = assignmentRepository.saveAndFlush(assignment);

        return assignmentMapper.toResponse(savedAssignment);
    }

    @Transactional(readOnly = true)
    public Page<AssignmentResponse> getAssignments(Pageable pageable) {

        return assignmentRepository.findAll(pageable).map(assignmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<AssetResponse> getUserAssets(Long userId, Pageable pageable, Authentication authentication) {

        User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));

        boolean isEmployee = authentication.getAuthorities().stream().
                anyMatch(authority -> authority.getAuthority().equals("ROLE_EMPLOYEE"));

        if (isEmployee && !user.getEmail().equalsIgnoreCase(authentication.getName())) {

            throw new AccessDeniedException("Employees can only access their own assets");
        }

        return assignmentRepository.findAllByUser_IdAndReturnedAtIsNull(userId, pageable)
                .map(assignment -> assetMapper.toResponse(assignment.getAsset()));
    }
}