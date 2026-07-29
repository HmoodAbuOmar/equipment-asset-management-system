package com.hmood.equipmentassetmanagement.asset.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateAssetRequest(

        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must not exceed 100 characters")
        String name,

        @NotBlank(message = "Category is required")
        @Size(max = 100, message = "Category must not exceed 100 characters")
        String category,

        @NotBlank(message = "Serial number is required")
        @Size(max = 100, message = "Serial number must not exceed 100 characters")
        String serialNumber,

        @PastOrPresent(message = "Purchase date must not be in the future")
        LocalDate purchaseDate
) {
}