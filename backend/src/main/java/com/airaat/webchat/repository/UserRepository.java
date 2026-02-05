package com.airaat.webchat.repository;

import com.airaat.webchat.domain.model.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

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

    @Query(value = """
            WITH related_users AS (SELECT DISTINCT cp2.user_id AS user_id
                                   FROM chat_participant cp1
                                   JOIN chat_participant cp2 ON cp1.chat_id = cp2.chat_id
                                   WHERE cp1.user_id = :curr
                                     AND cp2.user_id <> :curr
                                   UNION
                                   SELECT DISTINCT cgm2.user_id AS user_id
                                   FROM chat_group_member cgm1
                                   JOIN chat_group_member cgm2 ON cgm1.group_id = cgm2.group_id
                                   WHERE cgm1.user_id = :curr
                                     AND cgm2.user_id <> :curr)
            
            SELECT usr.*
            FROM usr
            JOIN related_users ON usr.id = related_users.user_id
            """, nativeQuery = true)
    Set<User> findRelatedUsers(@Param("curr") long userId);
}
