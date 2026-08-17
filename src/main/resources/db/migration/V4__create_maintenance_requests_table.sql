CREATE TABLE maintenance_requests
(
    id                BIGSERIAL PRIMARY KEY,

    asset_id          BIGINT      NOT NULL,
    reported_by       BIGINT      NOT NULL,
    it_handler        BIGINT,

    issue_description TEXT        NOT NULL,
    status            VARCHAR(30) NOT NULL,
    request_date      TIMESTAMPTZ NOT NULL,

    CONSTRAINT fk_maintenance_requests_asset
        FOREIGN KEY (asset_id)
            REFERENCES assets (id),

    CONSTRAINT fk_maintenance_requests_reported_by
        FOREIGN KEY (reported_by)
            REFERENCES users (id),

    CONSTRAINT fk_maintenance_requests_it_handler
        FOREIGN KEY (it_handler)
            REFERENCES users (id),

    CONSTRAINT chk_maintenance_requests_status
        CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED'))
);

CREATE INDEX idx_maintenance_requests_asset_id
    ON maintenance_requests (asset_id);

CREATE INDEX idx_maintenance_requests_reported_by
    ON maintenance_requests (reported_by);

CREATE INDEX idx_maintenance_requests_it_handler
    ON maintenance_requests (it_handler);

CREATE INDEX idx_maintenance_requests_status
    ON maintenance_requests (status);