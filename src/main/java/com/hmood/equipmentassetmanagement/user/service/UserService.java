package com.hmood.equipmentassetmanagement.user.service;

import com.hmood.equipmentassetmanagement.user.dto.CreateUserRequest;
import com.hmood.equipmentassetmanagement.user.dto.UserResponse;
import com.hmood.equipmentassetmanagement.user.model.Role;
import com.hmood.equipmentassetmanagement.user.model.User;
import com.hmood.equipmentassetmanagement.user.repository.UserRepository;

import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hmood.equipmentassetmanagement.user.exception.EmailAlreadyExistsException;
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    @Transactional
    public UserResponse createUser(CreateUserRequest request) {

        String normalizedEmail =
                request.email().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(
                passwordEncoder.encode(request.password())
        );
        user.setRole(request.role());

        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(Role role) {

        return userRepository.findAllByRole(role)
                .stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole()
                ))
                .toList();
    }
}