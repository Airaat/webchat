package com.airaat.webchat.repository;

import com.airaat.webchat.domain.model.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<User, Long> {
    Optional<User> findByUsername(String username);

    List<User> findByUsernameContainingIgnoreCase(String username);

    boolean existsByUsername(String username);
}
