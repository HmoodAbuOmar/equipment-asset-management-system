package com.hmood.equipmentassetmanagement.assignment;

import com.hmood.equipmentassetmanagement.TestcontainersConfiguration;
import com.hmood.equipmentassetmanagement.asset.model.Asset;
import com.hmood.equipmentassetmanagement.asset.model.AssetStatus;
import com.hmood.equipmentassetmanagement.asset.repository.AssetRepository;
import com.hmood.equipmentassetmanagement.assignment.dto.AssignmentResponse;
import com.hmood.equipmentassetmanagement.assignment.dto.CreateAssignmentRequest;
import com.hmood.equipmentassetmanagement.assignment.exception.AssignmentNotAllowedException;
import com.hmood.equipmentassetmanagement.assignment.model.Assignment;
import com.hmood.equipmentassetmanagement.assignment.repository.AssignmentRepository;
import com.hmood.equipmentassetmanagement.assignment.service.AssignmentService;
import com.hmood.equipmentassetmanagement.user.model.Role;
import com.hmood.equipmentassetmanagement.user.model.User;
import com.hmood.equipmentassetmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class AssignmentServiceIntegrationTests {

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void createAssignmentAssignsAvailableAssetToEmployee() {

        User employee = new User();
        employee.setName("Assignment Test Employee");
        employee.setEmail("assignment.employee@example.com");
        employee.setPasswordHash("test-password-hash");
        employee.setRole(Role.EMPLOYEE);

        User savedEmployee = userRepository.saveAndFlush(employee);

        Asset asset = new Asset();
        asset.setName("Assignment Test Laptop");
        asset.setCategory("Laptop");
        asset.setSerialNumber("ASSIGNMENT-TEST-001");
        asset.setStatus(AssetStatus.AVAILABLE);

        Asset savedAsset = assetRepository.saveAndFlush(asset);

        CreateAssignmentRequest request =
                new CreateAssignmentRequest(
                        savedAsset.getId(),
                        savedEmployee.getId()
                );

        AssignmentResponse response =
                assignmentService.createAssignment(request);

        assertThat(response.id()).isNotNull();
        assertThat(response.assetId()).isEqualTo(savedAsset.getId());
        assertThat(response.userId()).isEqualTo(savedEmployee.getId());
        assertThat(response.assignedAt()).isNotNull();
        assertThat(response.returnedAt()).isNull();

        assertThat(assignmentRepository.count()).isEqualTo(1);

        Asset updatedAsset = assetRepository
                .findById(savedAsset.getId())
                .orElseThrow();

        assertThat(updatedAsset.getStatus())
                .isEqualTo(AssetStatus.ASSIGNED);

        assertThat(updatedAsset.getCurrentUser())
                .isNotNull();

        assertThat(updatedAsset.getCurrentUser().getId())
                .isEqualTo(savedEmployee.getId());
    }
    @Test
    void createAssignmentToNonEmployeeThrowsException() {

        User manager = new User();
        manager.setName("Assignment Test Manager");
        manager.setEmail("assignment.manager@example.com");
        manager.setPasswordHash("test-password-hash");
        manager.setRole(Role.MANAGER);

        User savedManager = userRepository.saveAndFlush(manager);

        Asset asset = new Asset();
        asset.setName("Manager Assignment Test Laptop");
        asset.setCategory("Laptop");
        asset.setSerialNumber("ASSIGNMENT-TEST-002");
        asset.setStatus(AssetStatus.AVAILABLE);

        Asset savedAsset = assetRepository.saveAndFlush(asset);

        CreateAssignmentRequest request =
                new CreateAssignmentRequest(
                        savedAsset.getId(),
                        savedManager.getId()
                );

        assertThatThrownBy(
                () -> assignmentService.createAssignment(request)
        )
                .isInstanceOf(AssignmentNotAllowedException.class)
                .hasMessage("Assets can only be assigned to employees");
    }

    @Test
    void createAssignmentForUnavailableAssetThrowsException() {

        User employee = new User();
        employee.setName("Unavailable Asset Test Employee");
        employee.setEmail("unavailable.asset.employee@example.com");
        employee.setPasswordHash("test-password-hash");
        employee.setRole(Role.EMPLOYEE);

        User savedEmployee = userRepository.saveAndFlush(employee);

        Asset asset = new Asset();
        asset.setName("Unavailable Assignment Test Laptop");
        asset.setCategory("Laptop");
        asset.setSerialNumber("ASSIGNMENT-TEST-003");
        asset.setStatus(AssetStatus.UNDER_MAINTENANCE);

        Asset savedAsset = assetRepository.saveAndFlush(asset);

        CreateAssignmentRequest request =
                new CreateAssignmentRequest(
                        savedAsset.getId(),
                        savedEmployee.getId()
                );

        assertThatThrownBy(
                () -> assignmentService.createAssignment(request)
        )
                .isInstanceOf(AssignmentNotAllowedException.class)
                .hasMessage("Asset is not available for assignment");
    }
    @Test
    void returnAssignmentMakesAssetAvailableAgain() {

        User employee = new User();
        employee.setName("Return Test Employee");
        employee.setEmail("return.test.employee@example.com");
        employee.setPasswordHash("test-password-hash");
        employee.setRole(Role.EMPLOYEE);

        User savedEmployee = userRepository.saveAndFlush(employee);

        Asset asset = new Asset();
        asset.setName("Return Test Laptop");
        asset.setCategory("Laptop");
        asset.setSerialNumber("ASSIGNMENT-TEST-004");
        asset.setStatus(AssetStatus.AVAILABLE);

        Asset savedAsset = assetRepository.saveAndFlush(asset);

        AssignmentResponse createdAssignment =
                assignmentService.createAssignment(
                        new CreateAssignmentRequest(
                                savedAsset.getId(),
                                savedEmployee.getId()
                        )
                );

        AssignmentResponse returnedAssignment =
                assignmentService.returnAssignment(
                        createdAssignment.id()
                );

        assertThat(returnedAssignment.returnedAt()).isNotNull();

        Asset updatedAsset = assetRepository
                .findById(savedAsset.getId())
                .orElseThrow();

        assertThat(updatedAsset.getStatus())
                .isEqualTo(AssetStatus.AVAILABLE);

        assertThat(updatedAsset.getCurrentUser())
                .isNull();
    }
    @Test
    void createAssignmentWhenActiveAssignmentAlreadyExistsThrowsException() {

        User employee = new User();
        employee.setName("Active Assignment Test Employee");
        employee.setEmail("active.assignment.employee@example.com");
        employee.setPasswordHash("test-password-hash");
        employee.setRole(Role.EMPLOYEE);

        User savedEmployee = userRepository.saveAndFlush(employee);

        Asset asset = new Asset();
        asset.setName("Active Assignment Test Laptop");
        asset.setCategory("Laptop");
        asset.setSerialNumber("ASSIGNMENT-TEST-005");
        asset.setStatus(AssetStatus.AVAILABLE);

        Asset savedAsset = assetRepository.saveAndFlush(asset);

        Assignment existingAssignment = new Assignment();
        existingAssignment.setAsset(savedAsset);
        existingAssignment.setUser(savedEmployee);
        existingAssignment.setAssignedAt(Instant.now());

        assignmentRepository.saveAndFlush(existingAssignment);

        CreateAssignmentRequest request =
                new CreateAssignmentRequest(
                        savedAsset.getId(),
                        savedEmployee.getId()
                );

        assertThatThrownBy(
                () -> assignmentService.createAssignment(request)
        )
                .isInstanceOf(AssignmentNotAllowedException.class)
                .hasMessage("Asset already has an active assignment");
    }

    @Test
    void databasePreventsTwoActiveAssignmentsForSameAsset() {

        User employee = new User();
        employee.setName("Race Guard Test Employee");
        employee.setEmail("race.guard.employee@example.com");
        employee.setPasswordHash("test-password-hash");
        employee.setRole(Role.EMPLOYEE);

        User savedEmployee = userRepository.saveAndFlush(employee);

        Asset asset = new Asset();
        asset.setName("Race Guard Test Laptop");
        asset.setCategory("Laptop");
        asset.setSerialNumber("ASSIGNMENT-TEST-006");
        asset.setStatus(AssetStatus.AVAILABLE);

        Asset savedAsset = assetRepository.saveAndFlush(asset);

        Assignment firstAssignment = new Assignment();
        firstAssignment.setAsset(savedAsset);
        firstAssignment.setUser(savedEmployee);
        firstAssignment.setAssignedAt(Instant.now());

        assignmentRepository.saveAndFlush(firstAssignment);

        Assignment secondAssignment = new Assignment();
        secondAssignment.setAsset(savedAsset);
        secondAssignment.setUser(savedEmployee);
        secondAssignment.setAssignedAt(Instant.now());

        assertThatThrownBy(() -> assignmentRepository.saveAndFlush(secondAssignment))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

}