package com.hmood.equipmentassetmanagement.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties(prefix = "security.jwt")
public record JwtProperties(

        @NotBlank(message = "JWT secret is required")
        String secret,

        @NotNull(message = "JWT access token expiration is required")
        Duration accessTokenExpiration
) {
}