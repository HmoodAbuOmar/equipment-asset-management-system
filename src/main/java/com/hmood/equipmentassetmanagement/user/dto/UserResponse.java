package com.hmood.equipmentassetmanagement.user.dto;

import com.hmood.equipmentassetmanagement.user.model.Role;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role
) {
}