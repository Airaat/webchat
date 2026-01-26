package com.airaat.webchat.repository;

import com.airaat.webchat.domain.model.Chat;
import com.airaat.webchat.domain.projection.ChatView;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends CrudRepository<Chat, Long> {
    @Query(value = """
            WITH user_chats AS (SELECT c.id, c.type, c.created_at, c.group_id, cgm.role, cgm.muted_until
                                FROM chat c
                                         JOIN chat_group cg ON c.group_id = cg.id
                                         JOIN chat_group_member cgm ON cg.id = cgm.group_id
                                WHERE cgm.user_id = :userId
                                /* group chats */
                                UNION
                                /* personal chats */
                                SELECT c.id, c.type, c.created_at, c.group_id, null, cp.muted_until
                                FROM chat c
                                         JOIN chat_participant cp ON c.id = cp.chat_id
                                WHERE cp.user_id = :userId),
                last_messages AS (SELECT m.chat_id,
                                         m.content,
                                         COALESCE(m.edited_at, m.created_at) AS last_message_at,
                                         ROW_NUMBER() OVER (PARTITION BY m.chat_id ORDER BY m.created_at DESC) AS rn
                                  FROM message m
                                  WHERE chat_id IN (SELECT id FROM user_chats)),
                chat_titles AS (SELECT c.id, cg.name AS title
                                FROM chat c
                                JOIN chat_group cg ON c.group_id = cg.id
                                WHERE c.id IN (SELECT id FROM user_chats)
                                UNION ALL
                                SELECT c.id, u.username AS title
                                FROM chat c
                                JOIN chat_participant cp ON c.id = cp.chat_id
                                JOIN usr u ON cp.user_id = u.id
                                WHERE c.id IN (SELECT id FROM user_chats) AND cp.user_id <> :userId)
            
            SELECT uc.*,
                   lm.content AS last_message,
                   lm.last_message_at,
                   ct.title
            FROM user_chats uc
            LEFT JOIN chat_titles ct ON uc.id = ct.id
            LEFT JOIN last_messages lm ON uc.id = lm.chat_id AND lm.rn = 1
            """, countQuery = """
                    WITH all_chats AS (SELECT c.*
                                       FROM chat c
                                         JOIN chat_group cg ON c.group_id = cg.id
                                         JOIN chat_group_member cgm ON cg.id = cgm.group_id
                                       WHERE cgm.user_id = :userId
                                       UNION
                                       SELECT c.*
                                       FROM chat c
                                         JOIN chat_participant cp ON c.id = cp.chat_id
                                       WHERE cp.user_id = :userId)
            
                    SELECT COUNT(*) FROM all_chats
            """, nativeQuery = true)
    Page<ChatView> findAllForUser(@Param("userId") Long userId, Pageable pageable);

    @Query(value = """
            WITH user_chats AS (SELECT c.id, c.type, c.created_at, c.group_id, cgm.role, cgm.muted_until
                                FROM chat c
                                         JOIN chat_group cg ON c.group_id = cg.id
                                         JOIN chat_group_member cgm ON cg.id = cgm.group_id
                                WHERE cgm.user_id = :userId
                                /* group chats */
                                UNION
                                /* personal chats */
                                SELECT c.id, c.type, c.created_at, c.group_id, null, cp.muted_until
                                FROM chat c
                                         JOIN chat_participant cp ON c.id = cp.chat_id
                                WHERE cp.user_id = :userId),
                last_messages AS (SELECT m.chat_id,
                                         m.content,
                                         COALESCE(m.edited_at, m.created_at) AS last_message_at,
                                         ROW_NUMBER() OVER (PARTITION BY m.chat_id ORDER BY m.created_at DESC) AS rn
                                  FROM message m
                                  WHERE chat_id IN (SELECT id FROM user_chats)),
                chat_titles AS (SELECT c.id, cg.name AS title
                                FROM chat c
                                JOIN chat_group cg ON c.group_id = cg.id
                                WHERE c.id IN (SELECT id FROM user_chats)
                                UNION ALL
                                SELECT c.id, u.username AS title
                                FROM chat c
                                JOIN chat_participant cp ON c.id = cp.chat_id
                                JOIN usr u ON cp.user_id = u.id
                                WHERE c.id IN (SELECT id FROM user_chats) AND cp.user_id <> :userId)
            
            SELECT uc.*,
                   lm.content AS last_message,
                   lm.last_message_at,
                   ct.title
            FROM user_chats uc
            LEFT JOIN chat_titles ct ON uc.id = ct.id
            LEFT JOIN last_messages lm ON uc.id = lm.chat_id AND lm.rn = 1
            WHERE LOWER(ct.title) LIKE LOWER(:searchTerm) || '%'
            LIMIT 20
            """, nativeQuery = true)
    List<ChatView> searchChatsForUser(@Param("userId") Long userId, @Param("searchTerm") String searchTerm);

    @Query(value = """
            WITH last_messages AS (SELECT m.chat_id,
                                          m.content,
                                          COALESCE(m.edited_at, m.created_at) AS last_message_at,
                                          ROW_NUMBER() OVER (PARTITION BY m.chat_id ORDER BY m.created_at DESC) AS rn
                                   FROM message m
                                   WHERE chat_id = :chatId),
                 chat_titles AS (SELECT c.id, cg.name AS title, cgm.muted_until, cgm.role
                                 FROM chat c
                                 JOIN chat_group cg ON c.group_id = cg.id
                                 JOIN chat_group_member cgm ON cgm.group_id = cg.id
                                 WHERE c.id = :chatId AND cgm.user_id = :userId
                                 UNION ALL
                                 SELECT c.id, u.username AS title, cp.muted_until, null
                                 FROM chat c
                                 JOIN chat_participant cp ON c.id = cp.chat_id
                                 JOIN usr u ON cp.user_id = u.id
                                 WHERE c.id = :chatId
                                   AND cp.user_id <> :userId)
            
            SELECT c.id,
                   c.type,
                   c.created_at,
                   c.group_id,
                   ct.role,
                   ct.muted_until,
                   lm.content AS last_message,
                   lm.last_message_at,
                   ct.title
            FROM chat c
            LEFT JOIN chat_titles ct ON c.id = ct.id
            LEFT JOIN last_messages lm ON c.id = lm.chat_id AND lm.rn = 1
            WHERE c.id = :chatId
            """, nativeQuery = true)
    Optional<ChatView> findByIdForUser(@Param("chatId") Long chatId, @Param("userId") Long userId);

    @Query(value = """
            SELECT c.*
            FROM chat c
            WHERE c.id = :chatId
              AND (EXISTS(SELECT 1
                         FROM chat_participant
                         WHERE chat_id = :chatId AND user_id = :userId)
                  OR EXISTS(SELECT 1
                            FROM chat c
                            JOIN chat_group cg ON c.group_id = cg.id
                            JOIN chat_group_member cgm ON cg.id = cgm.group_id
                            WHERE c.id = :chatId AND cgm.user_id = :userId))
            """, nativeQuery = true)
    Optional<Chat> findByIdAndUserId(@Param("chatId") Long chatId, @Param("userId") Long userId);

    @Query(value = """
            SELECT (EXISTS(SELECT 1
                         FROM chat_participant
                         WHERE chat_id = :chatId AND user_id = :userId)
                  OR EXISTS(SELECT 1
                            FROM chat c
                            JOIN chat_group cg ON c.group_id = cg.id
                            JOIN chat_group_member cgm ON cg.id = cgm.group_id
                            WHERE c.id = :chatId AND cgm.user_id = :userId))
            """, nativeQuery = true)
    boolean existsByIdAndUserId(Long chatId, Long userId);

    @Query("""
            SELECT c FROM Chat c
            LEFT JOIN FETCH c.participants p
            LEFT JOIN FETCH p.user
            WHERE c.id = :chatId
            """)
    Chat getByIdWithParticipants(@Param("chatId") Long id);

    @Query("""
            SELECT c FROM Chat c
            LEFT JOIN FETCH c.group g
            LEFT JOIN FETCH g.members m
            LEFT JOIN FETCH m.user
            WHERE c.id = :chatId
            """)
    Chat getByIdWithMembers(@Param("chatId") Long id);
}
