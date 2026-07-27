package com.hmood.equipmentassetmanagement.user.repository;

import com.hmood.equipmentassetmanagement.user.model.Role;
import com.hmood.equipmentassetmanagement.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmailIgnoreCase(String email);

    List<User> findAllByRole(Role role);
}