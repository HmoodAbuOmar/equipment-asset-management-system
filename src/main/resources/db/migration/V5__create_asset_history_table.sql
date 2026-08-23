CREATE TABLE asset_history
(
    id           BIGSERIAL PRIMARY KEY,

    asset_id     BIGINT      NOT NULL,
    performed_by BIGINT      NOT NULL,

    action_type  VARCHAR(50) NOT NULL,
    timestamp    TIMESTAMPTZ NOT NULL,
    notes        TEXT,

    CONSTRAINT fk_asset_history_asset
        FOREIGN KEY (asset_id)
            REFERENCES assets (id),

    CONSTRAINT fk_asset_history_performed_by
        FOREIGN KEY (performed_by)
            REFERENCES users (id),

    CONSTRAINT chk_asset_history_action_type
        CHECK (action_type IN (
                               'CREATED',
                               'UPDATED',
                               'ASSIGNED',
                               'RETURNED',
                               'MAINTENANCE_REPORTED',
                               'MAINTENANCE_STARTED',
                               'MAINTENANCE_RESOLVED'
            ))
);

CREATE INDEX idx_asset_history_performed_by
    ON asset_history (performed_by);

CREATE INDEX idx_asset_history_asset_timestamp
    ON asset_history (asset_id, timestamp);