package com.hmood.equipmentassetmanagement.user.controller;

import com.hmood.equipmentassetmanagement.asset.dto.AssetResponse;
import com.hmood.equipmentassetmanagement.assignment.service.AssignmentService;
import com.hmood.equipmentassetmanagement.user.dto.CreateUserRequest;
import com.hmood.equipmentassetmanagement.user.dto.UserResponse;
import com.hmood.equipmentassetmanagement.user.model.Role;
import com.hmood.equipmentassetmanagement.user.service.UserService;
import jakarta.validation.Valid;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AssignmentService assignmentService;

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.createUser(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getUsersByRole(@RequestParam Role role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'IT_SUPPORT', 'EMPLOYEE')")
    @GetMapping("/{id}/assets")
    public ResponseEntity<Page<AssetResponse>> getUserAssets(@PathVariable Long id, @PageableDefault(size = 20, sort = "assignedAt", direction = Sort.Direction.DESC) Pageable pageable,
                                                             Authentication authentication) {

        Page<AssetResponse> response = assignmentService.getUserAssets(id, pageable, authentication);

        return ResponseEntity.ok(response);
    }
}