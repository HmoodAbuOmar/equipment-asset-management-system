package com.hmood.equipmentassetmanagement.assignment.controller;

import com.hmood.equipmentassetmanagement.assignment.dto.AssignmentResponse;
import com.hmood.equipmentassetmanagement.assignment.dto.CreateAssignmentRequest;
import com.hmood.equipmentassetmanagement.assignment.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<AssignmentResponse> createAssignment(@Valid @RequestBody CreateAssignmentRequest request) {

        AssignmentResponse response = assignmentService.createAssignment(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/return")
    public ResponseEntity<AssignmentResponse> returnAssignment(@PathVariable Long id) {

        AssignmentResponse response = assignmentService.returnAssignment(id);

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<Page<AssignmentResponse>> getAssignments(@PageableDefault(size = 20, sort = "assignedAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<AssignmentResponse> response = assignmentService.getAssignments(pageable);

        return ResponseEntity.ok(response);
    }

}