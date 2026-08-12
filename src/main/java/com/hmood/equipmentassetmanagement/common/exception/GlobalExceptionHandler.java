package com.hmood.equipmentassetmanagement.common.exception;

import com.hmood.equipmentassetmanagement.asset.exception.AssetDeletionNotAllowedException;
import com.hmood.equipmentassetmanagement.asset.exception.AssetNotFoundException;
import com.hmood.equipmentassetmanagement.asset.exception.SerialNumberAlreadyExistsException;
import com.hmood.equipmentassetmanagement.assignment.exception.AssignmentNotAllowedException;
import com.hmood.equipmentassetmanagement.assignment.exception.AssignmentNotFoundException;
import com.hmood.equipmentassetmanagement.user.exception.EmailAlreadyExistsException;
import com.hmood.equipmentassetmanagement.user.exception.UserNotFoundException;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.context.MessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.validation.method.ParameterValidationResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiErrorResponse> handleEmailAlreadyExists(EmailAlreadyExistsException exception, HttpServletRequest request) {

        HttpStatus status = HttpStatus.CONFLICT;

        ApiErrorResponse response = new ApiErrorResponse(LocalDateTime.now(), status.value(), status.getReasonPhrase(), exception.getMessage(), request.getRequestURI(), Map.of());

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationErrors(MethodArgumentNotValidException exception, HttpServletRequest request) {

        Map<String, String> fieldErrors = new LinkedHashMap<>();

        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }

        HttpStatus status = HttpStatus.BAD_REQUEST;

        ApiErrorResponse response = new ApiErrorResponse(LocalDateTime.now(), status.value(), status.getReasonPhrase(), "Validation failed", request.getRequestURI(), fieldErrors);

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException exception, HttpServletRequest request) {

        HttpStatus status = HttpStatus.BAD_REQUEST;

        String message = "Invalid value for parameter '" + exception.getName() + "'";

        ApiErrorResponse response = new ApiErrorResponse(LocalDateTime.now(), status.value(), status.getReasonPhrase(), message, request.getRequestURI(), Map.of());

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(SerialNumberAlreadyExistsException.class)
    public ResponseEntity<ApiErrorResponse> handleSerialNumberAlreadyExists(SerialNumberAlreadyExistsException exception, HttpServletRequest request) {

        HttpStatus status = HttpStatus.CONFLICT;

        ApiErrorResponse response = new ApiErrorResponse(LocalDateTime.now(), status.value(), status.getReasonPhrase(), exception.getMessage(), request.getRequestURI(), Map.of());

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodValidation(HandlerMethodValidationException exception, HttpServletRequest request) {

        Map<String, String> fieldErrors = new LinkedHashMap<>();

        for (ParameterValidationResult validationResult : exception.getParameterValidationResults()) {

            String parameterName = validationResult.getMethodParameter().getParameterName();

            if (parameterName == null) {
                parameterName = "parameter";
            }

            String message = validationResult.getResolvableErrors().stream().map(MessageSourceResolvable::getDefaultMessage).filter(errorMessage -> errorMessage != null).findFirst().orElse("Invalid value");

            fieldErrors.putIfAbsent(parameterName, message);
        }

        HttpStatus status = HttpStatus.BAD_REQUEST;

        ApiErrorResponse response = new ApiErrorResponse(LocalDateTime.now(), status.value(), status.getReasonPhrase(), "Validation failed", request.getRequestURI(), fieldErrors);

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(AssetNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleAssetNotFoundException(AssetNotFoundException exception, HttpServletRequest request) {

        ApiErrorResponse response = new ApiErrorResponse(LocalDateTime.now(), HttpStatus.NOT_FOUND.value(), HttpStatus.NOT_FOUND.getReasonPhrase(), exception.getMessage(), request.getRequestURI(), null);

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    @ExceptionHandler(AssetDeletionNotAllowedException.class)
    public ResponseEntity<ApiErrorResponse> handleAssetDeletionNotAllowedException(
            AssetDeletionNotAllowedException exception,
            HttpServletRequest request) {

        ApiErrorResponse response = new ApiErrorResponse(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                HttpStatus.CONFLICT.getReasonPhrase(),
                exception.getMessage(),
                request.getRequestURI(),
                null
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleUserNotFound(
            UserNotFoundException exception,
            HttpServletRequest request
    ) {

        HttpStatus status = HttpStatus.NOT_FOUND;

        ApiErrorResponse response = new ApiErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(AssignmentNotAllowedException.class)
    public ResponseEntity<ApiErrorResponse> handleAssignmentNotAllowed(
            AssignmentNotAllowedException exception,
            HttpServletRequest request
    ) {

        HttpStatus status = HttpStatus.CONFLICT;

        ApiErrorResponse response = new ApiErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(AssignmentNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleAssignmentNotFound(
            AssignmentNotFoundException exception,
            HttpServletRequest request
    ) {

        HttpStatus status = HttpStatus.NOT_FOUND;

        ApiErrorResponse response = new ApiErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );

        return ResponseEntity.status(status).body(response);
    }
}