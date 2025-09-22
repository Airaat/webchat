package com.airaat.webchat.repository;

import com.airaat.webchat.domain.model.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends CrudRepository<User, Long> {
    List<User> findByUsernameContainingIgnoreCase(String username);

    boolean existsByUsername(String username);
}
