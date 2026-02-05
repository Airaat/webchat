package com.airaat.webchat.service;

import com.airaat.webchat.domain.dto.request.SignupRequest;
import com.airaat.webchat.domain.dto.request.UserUpdate;
import com.airaat.webchat.domain.enums.GlobalRole;
import com.airaat.webchat.domain.model.User;
import com.airaat.webchat.exception.ValidationError;
import com.airaat.webchat.repository.UserRepository;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@AllArgsConstructor
public class UserService implements UserDetailsService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    /**
     * @deprecated Use Principal.getName() + getByUsername() instead
     */
    public User current() {
        SecurityContext context = SecurityContextHolder.getContext();
        return (User) context.getAuthentication().getPrincipal();
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repository.findByUsername(username).orElseThrow(
                () -> new UsernameNotFoundException("User with username \"" + username + "\" not found"));
    }

    public User getByUsername(String username) {
        return repository.findByUsername(username).orElseThrow(
                () -> new EntityNotFoundException("User with username \"" + username + "\" not found"));
    }

    public User getById(Long id) {
        return repository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("User with id " + id + " not found"));
    }

    public List<User> getByIds(List<Long> ids) {
        return (List<User>) repository.findAllById(ids);
    }

    public List<User> findByUsername(String username) {
        return repository.findByUsernameContainingIgnoreCase(username);
    }

    public Set<User> findRelatedUsers(User user) {
        return repository.findRelatedUsers(user.getId());
    }

    @Transactional
    public User create(SignupRequest dto) {
        if (isUserExists(dto.getUsername())) {
            throw new EntityExistsException("Username already taken");
        }

        if (!Objects.equals(dto.getPassword(), dto.getConfirmPassword())) {
            throw new ValidationError("Passwords do not match");
        }

        User user = User.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .build();

        return repository.save(user);
    }

    @Transactional
    public void updateLastLogin(User user) {
        user.setLastLoginAt(LocalDateTime.now());
    }

    @Transactional
    public User update(User user, UserUpdate dto) {
        String username = dto.getUsername();

        if (isUserExists(username) && !Objects.equals(user.getUsername(), username)) {
            throw new EntityExistsException("Username already taken");
        }

        if (dto.hasPassword() && !Objects.equals(dto.getPassword(), dto.getConfirmPassword())) {
            throw new ValidationError("Passwords do not match");
        }

        if (dto.hasUsername()) {
            user.setUsername(dto.getUsername());
        }

        if (dto.hasPassword()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
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
    public void delete(User user) {
        repository.delete(user);
    }

    private boolean isUserExists(String username) {
        return repository.existsByUsername(username);
    }
}
