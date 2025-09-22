package com.airaat.webchat.service;

import com.airaat.webchat.domain.dto.request.UserCreate;
import com.airaat.webchat.domain.dto.request.UserUpdate;
import com.airaat.webchat.domain.enums.GlobalRole;
import com.airaat.webchat.domain.model.User;
import com.airaat.webchat.exception.ValidationError;
import com.airaat.webchat.repository.UserRepository;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class UserService {
    private final UserRepository repository;

    public User getById(Long id) {
        return repository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("User with id " + id + " not found"));
    }

    public List<User> findByUsername(String username) {
        return repository.findByUsernameContainingIgnoreCase(username);
    }

    @Transactional
    public User create(UserCreate dto) {
        if (isUserExists(dto.getUsername())) {
            throw new EntityExistsException("Username already taken");
        }

        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new ValidationError("Passwords do not match");
        }

        User user = User.builder()
                .username(dto.getUsername())
                .password(dto.getPassword())
                .build();

        return repository.save(user);
    }

    @Transactional
    public User update(Long id, UserUpdate dto) {
        User user = getById(id);
        String username = dto.getUsername();

        if (!user.getUsername().equals(username) && isUserExists(username)) {
            throw new EntityExistsException("Username already taken");
        }

        if (dto.hasPassword() && !dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new ValidationError("Passwords do not match");
        }

        if (dto.hasUsername()) {
            user.setUsername(dto.getUsername());
        }

        if (dto.hasPassword()) {
            user.setPassword(dto.getPassword());
        }

        if (dto.hasIsActive()) {
            user.setActive(dto.getIsActive());
        }

        if (dto.hasRole()) {
            try {
                GlobalRole role = GlobalRole.valueOf(dto.getRole().toUpperCase());
                user.setGlobalRole(role);
            } catch (IllegalArgumentException e) {
                throw new ValidationError("Invalid role: " + dto.getRole());
            }
        }

        return repository.save(user);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getById(id));
    }

    private boolean isUserExists(String username) {
        return repository.existsByUsername(username);
    }
}
