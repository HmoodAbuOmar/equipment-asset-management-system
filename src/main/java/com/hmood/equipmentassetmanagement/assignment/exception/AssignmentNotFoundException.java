package com.hmood.equipmentassetmanagement.assignment.exception;

public class AssignmentNotFoundException extends RuntimeException {

    public AssignmentNotFoundException(Long id) {
        super("Active assignment not found with id: " + id);
    }
}