package com.hmood.equipmentassetmanagement.asset.exception;

public class SerialNumberAlreadyExistsException extends RuntimeException {

    public SerialNumberAlreadyExistsException(String message) {
        super(message);
    }
}