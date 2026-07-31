package com.hmood.equipmentassetmanagement.asset.exception;

public class AssetDeletionNotAllowedException extends RuntimeException {

    public AssetDeletionNotAllowedException(String message) {
        super(message);
    }
}