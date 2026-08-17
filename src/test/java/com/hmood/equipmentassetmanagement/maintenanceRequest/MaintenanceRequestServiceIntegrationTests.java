package com.hmood.equipmentassetmanagement.maintenanceRequest;

import com.hmood.equipmentassetmanagement.TestcontainersConfiguration;
import com.hmood.equipmentassetmanagement.asset.model.Asset;
import com.hmood.equipmentassetmanagement.asset.model.AssetStatus;
import com.hmood.equipmentassetmanagement.asset.repository.AssetRepository;
import com.hmood.equipmentassetmanagement.maintenanceRequest.dto.CreateMaintenanceRequest;
import com.hmood.equipmentassetmanagement.maintenanceRequest.dto.MaintenanceRequestResponse;
import com.hmood.equipmentassetmanagement.maintenanceRequest.dto.ResolveMaintenanceRequest;
import com.hmood.equipmentassetmanagement.maintenanceRequest.model.MaintenanceStatus;
import com.hmood.equipmentassetmanagement.maintenanceRequest.repository.MaintenanceRequestRepository;
import com.hmood.equipmentassetmanagement.maintenanceRequest.service.MaintenanceRequestService;
import com.hmood.equipmentassetmanagement.user.model.Role;
import com.hmood.equipmentassetmanagement.user.model.User;
import com.hmood.equipmentassetmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class MaintenanceRequestServiceIntegrationTests {

    @Autowired
    private MaintenanceRequestService maintenanceRequestService;

    @Autowired
    private MaintenanceRequestRepository maintenanceRequestRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void maintenanceRequestCompletesFullLifecycle() {

        User employee = new User();
        employee.setName("Maintenance Test Employee");
        employee.setEmail("maintenance.employee@example.com");
        employee.setPasswordHash("test-password-hash");
        employee.setRole(Role.EMPLOYEE);

        User savedEmployee = userRepository.saveAndFlush(employee);

        User itSupport = new User();
        itSupport.setName("Maintenance Test IT");
        itSupport.setEmail("maintenance.it@example.com");
        itSupport.setPasswordHash("test-password-hash");
        itSupport.setRole(Role.IT_SUPPORT);

        User savedItSupport = userRepository.saveAndFlush(itSupport);

        Asset asset = new Asset();
        asset.setName("Maintenance Test Laptop");
        asset.setCategory("Laptop");
        asset.setSerialNumber("MAINTENANCE-TEST-001");
        asset.setStatus(AssetStatus.ASSIGNED);
        asset.setCurrentUser(savedEmployee);

        Asset savedAsset = assetRepository.saveAndFlush(asset);

        Authentication employeeAuthentication =
                new UsernamePasswordAuthenticationToken(
                        savedEmployee.getEmail(),
                        null
                );

        Authentication itAuthentication =
                new UsernamePasswordAuthenticationToken(
                        savedItSupport.getEmail(),
                        null
                );

        MaintenanceRequestResponse createdRequest =
                maintenanceRequestService.createMaintenanceRequest(
                        new CreateMaintenanceRequest(
                                savedAsset.getId(),
                                "Laptop screen is flickering"
                        ),
                        employeeAuthentication
                );

        assertThat(createdRequest.id()).isNotNull();
        assertThat(createdRequest.status())
                .isEqualTo(MaintenanceStatus.OPEN);

        MaintenanceRequestResponse startedRequest =
                maintenanceRequestService.startMaintenanceRequest(
                        createdRequest.id(),
                        itAuthentication
                );

        assertThat(startedRequest.status())
                .isEqualTo(MaintenanceStatus.IN_PROGRESS);

        assertThat(startedRequest.itHandlerId())
                .isEqualTo(savedItSupport.getId());

        Asset assetUnderMaintenance = assetRepository
                .findById(savedAsset.getId())
                .orElseThrow();

        assertThat(assetUnderMaintenance.getStatus())
                .isEqualTo(AssetStatus.UNDER_MAINTENANCE);

        MaintenanceRequestResponse resolvedRequest =
                maintenanceRequestService.resolveMaintenanceRequest(
                        createdRequest.id(),
                        new ResolveMaintenanceRequest(false)
                );

        assertThat(resolvedRequest.status())
                .isEqualTo(MaintenanceStatus.RESOLVED);

        Asset repairedAsset = assetRepository
                .findById(savedAsset.getId())
                .orElseThrow();

        assertThat(repairedAsset.getStatus())
                .isEqualTo(AssetStatus.ASSIGNED);

        assertThat(maintenanceRequestRepository.count())
                .isEqualTo(1);
    }

    @Test
    void resolveOpenMaintenanceRequestThrowsException() {

        User employee = new User();
        employee.setName("Invalid Transition Employee");
        employee.setEmail("invalid.transition.employee@example.com");
        employee.setPasswordHash("test-password-hash");
        employee.setRole(Role.EMPLOYEE);

        User savedEmployee = userRepository.saveAndFlush(employee);

        Asset asset = new Asset();
        asset.setName("Invalid Transition Laptop");
        asset.setCategory("Laptop");
        asset.setSerialNumber("MAINTENANCE-TEST-002");
        asset.setStatus(AssetStatus.ASSIGNED);
        asset.setCurrentUser(savedEmployee);

        Asset savedAsset = assetRepository.saveAndFlush(asset);

        Authentication employeeAuthentication =
                new UsernamePasswordAuthenticationToken(
                        savedEmployee.getEmail(),
                        null
                );

        MaintenanceRequestResponse createdRequest =
                maintenanceRequestService.createMaintenanceRequest(
                        new CreateMaintenanceRequest(
                                savedAsset.getId(),
                                "Laptop does not turn on"
                        ),
                        employeeAuthentication
                );

        assertThat(createdRequest.status())
                .isEqualTo(MaintenanceStatus.OPEN);

        assertThatThrownBy(
                () -> maintenanceRequestService.resolveMaintenanceRequest(
                        createdRequest.id(),
                        new ResolveMaintenanceRequest(false)
                )
        )
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(
                        "Only IN_PROGRESS maintenance requests can be resolved"
                );
    }
}