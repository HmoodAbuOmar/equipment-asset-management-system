package com.hmood.equipmentassetmanagement.maintenanceRequest.model;

import com.hmood.equipmentassetmanagement.asset.model.Asset;
import com.hmood.equipmentassetmanagement.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "maintenance_requests")
@Getter
@Setter
@NoArgsConstructor
public class MaintenanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY , optional = false)
    @JoinColumn(name="asset_id",nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY , optional = false)
    @JoinColumn(name="reported_by",nullable = false)
    private User reportedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="it_handler")
    private User itHandler;

    @Column(name="issue_description",nullable = false)
    private String issueDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceStatus status;

    @Column(name="request_date",nullable = false)
    private Instant requestDate;

}
