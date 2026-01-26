package com.airaat.webchat.repository;

import com.airaat.webchat.domain.model.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<User, Long> {
    Optional<User> findByUsername(String username);

    @Query(value = """
            SELECT * FROM usr
            WHERE LOWER(username) LIKE LOWER(:username) || '%'
            LIMIT 20
            """, nativeQuery = true)
    List<User> findByUsernameContainingIgnoreCase(@Param("username") String username);

    boolean existsByUsername(String username);
}
