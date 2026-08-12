package com.hmood.equipmentassetmanagement.assignment.repository;

import com.hmood.equipmentassetmanagement.assignment.model.Assignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    boolean existsByAsset_IdAndReturnedAtIsNull(Long assetId);

    @EntityGraph(attributePaths = {"asset"})
    Page<Assignment> findAllByUser_IdAndReturnedAtIsNull(Long userId, Pageable pageable);

    Optional<Assignment> findByIdAndReturnedAtIsNull(Long id);

    @EntityGraph(attributePaths = {"asset", "user"})
    Page<Assignment> findAll(Pageable pageable);
}