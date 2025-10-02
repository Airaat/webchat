package com.airaat.webchat.repository;

import com.airaat.webchat.domain.model.ChatParticipant;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatParticipantRepository extends CrudRepository<ChatParticipant, Long> {
    @Query(value = """
            SELECT COUNT(c.*) > 0
            FROM chat c
            WHERE EXISTS (SELECT 1
                          FROM chat_participant cp
                          WHERE cp.chat_id = c.id AND cp.user_id = :userId1)
            AND EXISTS (SELECT 1
                        FROM chat_participant cp
                        WHERE cp.chat_id = c.id AND cp.user_id = :userId2)
            """, nativeQuery = true)
    boolean existsPrivateChatBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
